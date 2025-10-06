import os
import sys
import logging
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
from config import config
from models import MongoDB, DBManager
from utils.file_utils import allowed_file, extract_text
# from transformers import pipeline  # Commented out as unused after disabling LLM
import uuid
import tempfile
from tasks import analyze_document_task
from celery_app import celery_app

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])
CORS(app)

# Initialize MongoDB and DB Manager
mongo_db = MongoDB(uri=app.config['MONGODB_URI'], db_name=app.config['MONGO_DB'])
db_manager = DBManager(mongo_db)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/api/upload-document', methods=['POST'])
def upload_document():
    logger.info("Upload document request received")
    if 'file' not in request.files:
        logger.error("No file provided in request")
        return jsonify(error='No file provided'), 400
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        logger.error(f"Invalid file type: {file.filename}")
        return jsonify(error='Invalid file type'), 400
    if file.content_length > app.config['MAX_CONTENT_LENGTH']:
        logger.error(f"File too large: {file.content_length} bytes")
        return jsonify(error='File too large'), 400
    try:
        filename = secure_filename(file.filename)
        logger.info(f"Processing file: {filename}")
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        unique_filename = str(uuid.uuid4()) + '.' + ext
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        logger.info(f"Saving file to: {save_path}")
        file.save(save_path)
        logger.info("File saved successfully, extracting text")
        text = extract_text(save_path)
        logger.info(f"Text extracted, length: {len(text)}")
        doc_id = db_manager.store_document_metadata_and_content(filename, text, save_path)
        logger.info(f"Document stored in DB with ID: {doc_id}")
        return jsonify(document_id=doc_id), 200
    except Exception as e:
        logger.error(f"Error during upload: {str(e)}", exc_info=True)
        return jsonify(error=str(e)), 500

@app.route('/api/analyze-document', methods=['POST'])
def analyze_document():
    try:
        data = request.get_json()
        doc_id = data.get('document_id')
        # Get document
        document = db_manager.get_document(doc_id)
        if not document:
            return jsonify(error='Document not found'), 404
        # Start Celery task
        task = analyze_document_task.delay(doc_id)
        return jsonify(task_id=task.id, status='processing'), 202
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/task-status/<task_id>', methods=['GET'])
def task_status(task_id):
    from celery_app import celery_app
    task = celery_app.AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {'state': task.state, 'status': 'Pending...'}
    elif task.state == 'PROGRESS':
        response = {'state': task.state, 'status': task.info.get('status', '')}
    elif task.state == 'SUCCESS':
        response = {'state': task.state, 'result': task.result}
    else:
        response = {'state': task.state, 'status': str(task.info)}
    return jsonify(response)

@app.route('/api/search-documents', methods=['POST'])
def search_documents():
    try:
        data = request.json
        query = data.get('query')
        filters = data.get('filters', {})

        if not query:
            return jsonify({'error': 'Missing search query'}), 400

        # Perform simple regex search on content
        collection = mongo_db.get_documents_collection()
        import re
        regex = re.compile(query, re.IGNORECASE)
        results_cursor = collection.find({'content': {'$regex': regex}}).limit(10)
        results = list(results_cursor)
        for doc in results:
            doc.pop('content', None)  # Remove content for results
            doc['upload_time'] = doc['upload_time'].isoformat()

        return jsonify({'results': results}), 200
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/documents', methods=['GET'])
def list_documents():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    sort_by = request.args.get('sort_by', 'upload_time')
    order = request.args.get('order', 'desc')

    collection = mongo_db.get_documents_collection()
    sort_order = -1 if order == 'desc' else 1
    documents_cursor = collection.find().sort(sort_by, sort_order).skip((page-1)*per_page).limit(per_page)
    documents = list(documents_cursor)
    total = collection.count_documents({})

    # Convert to dict, remove content for list
    for doc in documents:
        doc.pop('content', None)
        doc['upload_time'] = doc['upload_time'].isoformat()

    return jsonify({
        'documents': documents,
        'total': total,
        'page': page,
        'per_page': per_page
    })

@app.route('/api/dashboard-stats', methods=['GET'])
def dashboard_stats():
    collection = mongo_db.get_documents_collection()
    total_documents = collection.count_documents({})
    recent_uploads_cursor = collection.find().sort('upload_time', -1).limit(5)
    recent_uploads = list(recent_uploads_cursor)
    for doc in recent_uploads:
        doc.pop('content', None)
        doc['upload_time'] = doc['upload_time'].isoformat()

    analysis_collection = mongo_db.get_analysis_results_collection()
    pipeline = [
        {
            '$group': {
                '_id': '$analysis_results',
                'count': {'$sum': 1}
            }
        }
    ]
    analysis_counts_cursor = analysis_collection.aggregate(pipeline)
    analysis_counts = [{'analysis_types': ac['_id'], 'count': ac['count']} for ac in analysis_counts_cursor]

    return jsonify({
        'total_documents': total_documents,
        'recent_uploads': recent_uploads,
        'analysis_counts': analysis_counts
    })

@app.route('/api/export-analysis', methods=['POST'])
def export_analysis():
    data = request.json
    task_id = data.get('task_id')
    logger.info(f"Export analysis called with incoming task_id: {task_id}")

    if not task_id:
        return jsonify({'error': 'Missing task_id'}), 400

    # Get task status
    task = celery_app.AsyncResult(task_id)
    logger.info(f"Task state: {task.state}")
    if task.state == 'PENDING':
        return jsonify({'message': 'Analysis not ready'}), 202
    elif task.state != 'SUCCESS':
        return jsonify({'error': 'Analysis failed or not completed'}), 409

    # Extract document_id from task result
    result = task.result
    import json
    logger.info(f"Full task result JSON: {json.dumps(result, default=str)}")
    if not isinstance(result, dict) or 'document_id' not in result:
        return jsonify({'error': 'Invalid task result'}), 500

    document_id = result['document_id']

    # Get analysis from MongoDB
    analysis_collection = mongo_db.get_analysis_results_collection()
    analysis_doc = analysis_collection.find_one({'document_id': document_id})
    if not analysis_doc:
        return jsonify({'error': 'Analysis not found in database'}), 404

    analysis = analysis_doc['analysis_results']

    # Log actual values and types before validation
    summary_val = analysis.get('summary')
    clauses_val = analysis.get('clauses')
    risks_val = analysis.get('risks')
    logger.info(f"result.summary: {summary_val}, typeof: {type(summary_val)}, length: {len(summary_val) if isinstance(summary_val, str) else 'N/A'}")
    logger.info(f"result.clauses: {clauses_val}, typeof: {type(clauses_val)}, length: {len(clauses_val) if isinstance(clauses_val, list) else 'N/A'}")
    logger.info(f"result.risks: {risks_val}, typeof: {type(risks_val)}, length: {len(risks_val) if isinstance(risks_val, list) else 'N/A'}")

    # Temporarily disable strict validation - log warning but attempt PDF generation
    if not ('summary' in analysis and analysis['summary']):
        logger.warning("Validation warning: summary missing or empty, but proceeding with PDF generation for debugging")

    # Log data lengths if present
    clauses_count = len(analysis['clauses']) if 'clauses' in analysis and isinstance(analysis['clauses'], list) else 0
    risks_count = len(analysis['risks']) if 'risks' in analysis and isinstance(analysis['risks'], list) else 0
    logger.info(f"PDF export data - Summary length: {len(analysis.get('summary', ''))}, Clauses count: {clauses_count}, Risks count: {risks_count}")

    # Generate PDF report
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    c = canvas.Canvas(temp_file.name, pagesize=letter)
    width, height = letter

    c.drawString(100, height - 100, f"Analysis Report for Document ID: {document_id}")
    c.drawString(100, height - 120, f"Summary: {analysis.get('summary', 'No summary available')}")

    # Risks (optional)
    if risks_count > 0:
        c.drawString(100, height - 140, f"Risks: {', '.join(analysis.get('risks', []))}")

    # Clauses (optional)
    y_pos = height - 160
    if clauses_count > 0:
        c.drawString(100, y_pos, "Clauses:")
        y_pos -= 20
        for clause in analysis.get('clauses', []):
            clause_text = f"{clause.get('type', 'Unknown')}: {clause.get('heading', '')} - {clause.get('content', '')[:200]}..."
            c.drawString(120, y_pos, clause_text)
            y_pos -= 20
            if y_pos < 50:  # Prevent going off page
                break

    c.save()
    temp_file.close()

    return send_file(temp_file.name, as_attachment=True, download_name=f'analysis_report_{document_id}.pdf')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=app.config['DEBUG'])
