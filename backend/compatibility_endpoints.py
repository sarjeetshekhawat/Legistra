"""
Compatibility endpoints retained for backward support and transition logic.
These endpoints are not part of the core business APIs.
"""

from flask import jsonify, request, send_file
import logging
import uuid
import time
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.platypus import Image
import os

# Import Supabase DB layer
import sys
import os
sys.path.append(os.path.dirname(__file__))
from models_supabase import SupabaseDB
supabase_db = SupabaseDB()
import io
from config import config

# Get environment from env variable
env = os.getenv('FLASK_ENV', 'development')

logger = logging.getLogger(__name__)

def add_legistra_logo_to_pdf(canvas_obj, x, y, width=50):
    """
    Add the official Legistra logo to PDF canvas using the LOGO.png file
    """
    try:
        # Path to the LOGO.png file
        logo_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'assets', 'logo', 'LOGO.png')
        
        if os.path.exists(logo_path):
            # Add the logo image to the PDF
            logo_image = Image(logo_path, width=width, height=width)
            logo_image.drawOn(canvas_obj, x, y)
        else:
            # Fallback: Draw a simple placeholder if logo file is not found
            logger.warning(f"Logo file not found at {logo_path}, using placeholder")
            canvas_obj.setFillColorRGB(0.12, 0.23, 0.54)  # Dark navy
            canvas_obj.rect(x, y, width, width, fill=1)
            canvas_obj.setFillColorRGB(1.0, 1.0, 1.0)  # White
            canvas_obj.drawString(x + 5, y + width/2, "LEGISTRA")
    except Exception as e:
        logger.error(f"Error adding logo to PDF: {str(e)}")
        # Fallback: Draw a simple placeholder
        canvas_obj.setFillColorRGB(0.12, 0.23, 0.54)  # Dark navy
        canvas_obj.rect(x, y, width, width, fill=1)
        canvas_obj.setFillColorRGB(1.0, 1.0, 1.0)  # White
        canvas_obj.drawString(x + 5, y + width/2, "LEGISTRA")

def analyze_document_temp():
    """
    Temporary synchronous analysis endpoint using real ML analysis
    """
    try:
        # Validate request data
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify(error='Content-Type must be application/json'), 400
        
        data = request.get_json()
        if not data:
            logger.error("Empty request body")
            return jsonify(error='Request body is required'), 400
        
        document_id = data.get('document_id')
        if not document_id:
            logger.error("Missing document_id in request")
            return jsonify(error='document_id is required'), 400
        
        logger.info(f"Starting real ML analysis for document: {document_id}")
        
        # Import real ML task (synchronous version)
        from ml_analysis_sync import analyze_document_ml_sync
        
        # Run real ML task directly
        try:
            result = analyze_document_ml_sync(document_id)
            
            if result and 'error' not in result:
                logger.info(f"Real ML analysis completed for document: {document_id}")
                return jsonify(document_id=document_id, analysis=result['analysis'], status='completed'), 200
            else:
                error_msg = result.get('error', 'Unknown analysis error') if result else 'Analysis failed'
                logger.error(f"Real ML analysis failed: {error_msg}")
                return jsonify(error=error_msg), 500
        except Exception as task_error:
            logger.error(f"Task execution error: {str(task_error)}", exc_info=True)
            return jsonify(error=f'Task execution failed: {str(task_error)}'), 500
        
    except Exception as e:
        logger.error(f"Error in real ML analysis endpoint: {str(e)}", exc_info=True)
        return jsonify(error=f'Failed to start analysis: {str(e)}'), 500

def export_analysis_temp(document_id):
    """
    Temporary export analysis endpoint for synchronous ML analysis
    """
    if not document_id:
        return jsonify(error='document_id is required'), 400
    
    logger.info(f"Export analysis called for document: {document_id}")
    
    try:
        # Get analysis from Supabase
        all_analysis = supabase_db.read_all_analysis()
        analysis = None
        for analysis_id, analysis_data in all_analysis.items():
            if analysis_data.get('document_id') == document_id:
                analysis = analysis_data
                break
        
        if not analysis:
            logger.error(f"Analysis not found in database for document: {document_id}")
            return jsonify(error='Analysis not found in database'), 404
        
        analysis_results = analysis['analysis_results']
        
        # Validate analysis data
        if not analysis_results:
            logger.error(f"Empty analysis data for document: {document_id}")
            return jsonify(error='Analysis data is empty'), 404
        
        logger.info(f"Found analysis data for document: {document_id}")
        logger.info(f"Summary length: {len(analysis_results.get('summary', ''))}")
        logger.info(f"Clauses count: {len(analysis_results.get('clauses', []))}")
        logger.info(f"Risks count: {len(analysis_results.get('risks', []))}")
        
        # Generate PDF
        buffer = io.BytesIO()
        
        # Create PDF canvas
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Draw logo in top-right corner
        add_legistra_logo_to_pdf(p, width - 80, height - 80, 50)
        
        # Title
        p.setFont("Helvetica-Bold", 16)
        p.drawString(72, height - 72, f"Legal Document Analysis Report")
        p.setFont("Helvetica", 12)
        p.drawString(72, height - 92, f"Document ID: {document_id}")
        p.drawString(72, height - 108, f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Summary
        y_pos = height - 140
        p.setFont("Helvetica-Bold", 14)
        p.drawString(72, y_pos, "Summary")
        y_pos -= 20
        
        summary = analysis_results.get('summary', 'No summary available')
        if summary:
            # Wrap text for PDF
            lines = []
            words = summary.split()
            current_line = []
            for word in words:
                if len(' '.join(current_line + [word])) > 80:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    current_line.append(word)
            if current_line:
                lines.append(' '.join(current_line))
            
            for line in lines:
                if y_pos < 72:  # Prevent going off page
                    p.showPage()
                    y_pos = height - 72
                p.drawString(72, y_pos, line)
                y_pos -= 15
        
        y_pos -= 20
        
        # Clauses
        if analysis_results.get('clauses'):
            p.setFont("Helvetica-Bold", 14)
            p.drawString(72, y_pos, "Identified Clauses")
            y_pos -= 20
            
            clauses = analysis_results['clauses']
            for clause in clauses[:10]:  # Limit to 10 clauses
                if y_pos < 72:
                    p.showPage()
                    y_pos = height - 72
                
                clause_type = clause.get('type', 'Unknown')
                heading = clause.get('heading', 'No heading')
                content = clause.get('content', '')
                
                p.setFont("Helvetica-Bold", 12)
                p.drawString(72, y_pos, f"{clause_type.replace('_', ' ').title()}: {heading}")
                y_pos -= 15
                
                p.setFont("Helvetica", 10)
                # Wrap content
                content_lines = content.split('\n')
                for content_line in content_lines[:3]:  # Limit content per clause
                    if y_pos < 72:
                        p.showPage()
                        y_pos = height - 72
                    p.drawString(72, y_pos, content_line[:80])
                    y_pos -= 12
                y_pos -= 10
        
        # Risks
        if analysis_results.get('risks'):
            y_pos -= 20
            p.setFont("Helvetica-Bold", 14)
            p.drawString(72, y_pos, "Risk Assessment")
            y_pos -= 20
            
            risks = analysis_results['risks']
            for risk in risks:
                if y_pos < 72:
                    p.showPage()
                    y_pos = height - 72
                p.drawString(72, y_pos, f"• {risk}")
                y_pos -= 15
        
        p.save()
        
        # Return PDF as downloadable file
        buffer.seek(0)
        
        return send_file(
            io.BytesIO(buffer.getvalue()),
            as_attachment=True,
            download_name=f'analysis_report_{document_id}.pdf',
            mimetype='application/pdf'
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        return jsonify(error=f'Failed to generate PDF: {str(e)}'), 500

def task_status_temp(task_id):
    """
    Temporary task status endpoint (for compatibility)
    """
    if not task_id:
        return jsonify(error='task_id is required'), 400
    
    logger.info(f"Checking temporary task status for: {task_id}")
    
    try:
        # For synchronous analysis, tasks are either completed or don't exist
        return jsonify({
            'state': 'SUCCESS',
            'status': 'Analysis completed',
            'task_id': task_id,
            'message': 'Synchronous analysis completed'
        })
        
    except Exception as e:
        logger.error(f"Error checking temporary task status: {str(e)}", exc_info=True)
        return jsonify(error=f'Failed to get task status: {str(e)}'), 500

def analyze_document_multilingual_temp():
    """
    Multilingual document analysis endpoint supporting Hindi, Marathi, and English
    """
    try:
        # Validate request data
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify(error='Content-Type must be application/json'), 400
        
        data = request.get_json()
        if not data:
            logger.error("Empty request body")
            return jsonify(error='Request body is required'), 400
        
        document_id = data.get('document_id')
        if not document_id:
            logger.error("Missing document_id in request")
            return jsonify(error='document_id is required'), 400
        
        logger.info(f"Starting multilingual ML analysis for document: {document_id}")
        
        # Import multilingual ML task
        from multilingual_analysis import analyze_document_multilingual_sync
        
        # Run multilingual ML task directly
        try:
            result = analyze_document_multilingual_sync(document_id)
            
            if result and 'error' not in result:
                logger.info(f"Multilingual ML analysis completed for document: {document_id}")
                return jsonify(result), 200
            else:
                error_msg = result.get('error', 'Unknown analysis error') if result else 'Analysis failed'
                logger.error(f"Multilingual ML analysis failed: {error_msg}")
                return jsonify(error=error_msg), 500
        except Exception as task_error:
            logger.error(f"Multilingual task execution error: {str(task_error)}", exc_info=True)
            return jsonify(error=f'Task execution failed: {str(task_error)}'), 500
        
    except Exception as e:
        logger.error(f"Error in multilingual analysis endpoint: {str(e)}", exc_info=True)
        return jsonify(error=f'Failed to start analysis: {str(e)}'), 500

def analyze_document_fast_multilingual_temp(mongo_db, simple_db):
    """
    Fast multilingual document analysis endpoint with optimized performance
    """
    try:
        # Validate request data
        if not request.is_json:
            logger.error("Request is not JSON")
            return jsonify(error='Content-Type must be application/json'), 400
        
        data = request.get_json()
        if not data:
            logger.error("Empty request body")
            return jsonify(error='Request body is required'), 400
        
        document_id = data.get('document_id')
        if not document_id:
            logger.error("Missing document_id in request")
            return jsonify(error='document_id is required'), 400
        
        logger.info(f"Starting fast multilingual ML analysis for document: {document_id}")
        
        # Debug: Check db instance
        logger.info(f"Using supabase_db instance: {simple_db}")
        
        # Debug: List all documents
        all_docs = simple_db.read_all_documents()
        logger.info(f"Available documents ({len(all_docs)}):")
        for doc_id, doc_data in all_docs.items():
            logger.info(f"  - {doc_id}: {doc_data.get('filename', 'N/A')}")
        
        # Use Supabase to get the document
        document = None
        if document_id in all_docs:
            document = all_docs[document_id]
            logger.info(f"Found document in database: {document}")
            logger.info(f"Document user_id: {document.get('user_id', 'N/A')}")
            logger.info(f"Request user_id: {request.current_user['user_id']}")
        else:
            logger.info(f"Document {document_id} not found in database")
            logger.info(f"Available document IDs: {list(all_docs.keys())}")
        
        if not document:
            logger.error(f"Document not found: {document_id}")
            return jsonify(error='Document not found'), 404
        
        # Check if document belongs to current user
        if document.get('user_id') != request.current_user['user_id']:
            logger.error(f"Access denied for document: {document_id}, user: {request.current_user['user_id']}")
            return jsonify(error='Access denied'), 403
        
        logger.info(f"Document found and ownership verified for: {document_id}")
        
        # Import fast multilingual ML task
        from multilingual_analysis import analyze_document_fast_multilingual_sync
        
        # Run fast multilingual ML task directly
        try:
            result = analyze_document_fast_multilingual_sync(document_id)
            
            if result and 'error' not in result:
                logger.info(f"Fast multilingual ML analysis completed for document: {document_id}")
                return jsonify(result), 200
            else:
                error_msg = result.get('error', 'Unknown analysis error') if result else 'Analysis failed'
                logger.error(f"Fast multilingual ML analysis failed: {error_msg}")
                return jsonify(error=error_msg), 500
        except Exception as task_error:
            logger.error(f"Fast multilingual task execution error: {str(task_error)}", exc_info=True)
            return jsonify(error=f'Task execution failed: {str(task_error)}'), 500
        
    except Exception as e:
        logger.error(f"Error in fast multilingual analysis endpoint: {str(e)}", exc_info=True)
        return jsonify(error=f'Failed to start analysis: {str(e)}'), 500
