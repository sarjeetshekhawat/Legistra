import sys
import os
path_to_add = os.path.join(os.path.dirname(__file__), '..')
print(f"Adding path: {path_to_add}")
sys.path.append(path_to_add)
print(f"sys.path: {sys.path}")

from celery_app import celery_app
from models import MongoDB, DBManager
from config import config
import time
import torch
import pandas as pd
from transformers import pipeline, AutoTokenizer
from ml.monitoring.drift_detection import detect_drift, retrain_trigger
import logging

# Set up logging for tasks
logger = logging.getLogger(__name__)

# Get environment from env variable
env = os.getenv('FLASK_ENV', 'development')

# Initialize MongoDB connection (will be recreated in task if needed)
mongo_db = None
db_manager = None

def get_db_manager():
    """Get or create DB manager instance"""
    global mongo_db, db_manager
    if mongo_db is None or db_manager is None:
        mongo_db = MongoDB(uri=config[env].MONGODB_URI, db_name=config[env].MONGO_DB)
        db_manager = DBManager(mongo_db)
    return db_manager

@celery_app.task(bind=True, name='tasks.analyze_document_task')
def analyze_document_task(self, doc_id):
    """
    Analyze a legal document asynchronously.
    
    Args:
        doc_id: Document ID from MongoDB
        
    Returns:
        dict: Analysis results with document_id and analysis data
    """
    logger.info(f"Starting analysis task for document: {doc_id}")
    self.update_state(state='STARTED', meta={'status': 'Analysis started'})
    
    try:
        db_mgr = get_db_manager()
        document = db_mgr.get_document(doc_id)
        if not document:
            error_msg = f'Document not found: {doc_id}'
            logger.error(error_msg)
            self.update_state(state='FAILURE', meta={'error': error_msg})
            return {'error': error_msg}
        
        logger.info(f"Document found, content length: {len(document.get('content', ''))}")
        text = document['content']
        start_time = time.time()
        
        # Update status to PROGRESS
        self.update_state(state='PROGRESS', meta={'status': 'Processing document...', 'progress': 10})
        
        try:
            # Log original text length
            logger.info(f"Original text length (chars): {len(text)}")
            # Use tokenizer to truncate text to model max length tokens (1024 tokens)
            self.update_state(state='PROGRESS', meta={'status': 'Tokenizing text...', 'progress': 20})
            tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
            max_tokens = 1024
            tokens = tokenizer.encode(text, truncation=True, max_length=max_tokens)
            logger.info(f"Tokenized input length after truncation: {len(tokens)}")
            truncated_text = tokenizer.decode(tokens, skip_special_tokens=True)
            logger.info(f"Truncated text length (chars): {len(truncated_text)}")
            
            # Generate summary
            self.update_state(state='PROGRESS', meta={'status': 'Generating summary...', 'progress': 40})
            summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
            summary = summarizer(truncated_text, max_length=150, min_length=30, do_sample=False)[0]['summary_text']
            # Advanced clause extraction and identification
            self.update_state(state='PROGRESS', meta={'status': 'Extracting clauses...', 'progress': 60})
            import re

            # Define clause patterns and their corresponding types
            clause_patterns = {
                'confidentiality': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:confidentiality|confidential|non-disclosure|nda)',
                    r'(?i)confidentiality\s*(?:agreement|clause|provision)',
                    r'(?i)non-disclosure\s*(?:agreement|clause|provision)'
                ],
                'indemnity': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:indemnity|indemnification)',
                    r'(?i)indemnity\s*(?:clause|provision|agreement)',
                    r'(?i)indemnification\s*(?:clause|provision|agreement)'
                ],
                'liability': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:liability|limitation of liability)',
                    r'(?i)liability\s*(?:clause|provision|limitation)',
                    r'(?i)limitation\s*of\s*liability'
                ],
                'termination': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:termination|termination of agreement)',
                    r'(?i)termination\s*(?:clause|provision|rights|conditions)',
                    r'(?i)term\s*and\s*termination'
                ],
                'governing_law': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:governing law|governing law and jurisdiction)',
                    r'(?i)governing\s*(?:law|jurisdiction)',
                    r'(?i)applicable\s*law'
                ],
                'dispute_resolution': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:dispute|arbitration|dispute resolution)',
                    r'(?i)dispute\s*(?:resolution|settlement)',
                    r'(?i)arbitration\s*(?:clause|agreement|provision)'
                ],
                'payment_terms': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:payment|compensation|fees)',
                    r'(?i)payment\s*(?:terms|conditions|schedule)',
                    r'(?i)compensation\s*(?:clause|provision)'
                ],
                'intellectual_property': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:intellectual property|ip|copyright|patent)',
                    r'(?i)intellectual\s*property\s*(?:rights|clause|provision)',
                    r'(?i)ip\s*(?:rights|clause|provision)'
                ],
                'warranties': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:warranty|warranties|representations)',
                    r'(?i)warranty\s*(?:clause|provision|disclaimer)',
                    r'(?i)representations?\s*and\s*warranties?'
                ],
                'definitions': [
                    r'(?i)(?:article|section|clause)\s*\d*\.?\s*(?:definitions?|defined terms)',
                    r'(?i)definitions?\s*(?:clause|section)',
                    r'(?i)defined\s*terms?'
                ]
            }

            # Split text into paragraphs/lines for better clause identification
            paragraphs = re.split(r'\n\s*\n|\n(?=[A-Z][^a-z]*:|\d+\.)', text)

            identified_clauses = []
            remaining_text = text

            # Find and extract each type of clause
            for clause_type, patterns in clause_patterns.items():
                for pattern in patterns:
                    matches = list(re.finditer(pattern, remaining_text, re.IGNORECASE))
                    for match in matches:
                        # Find the clause boundaries (next section heading or end of text)
                        start_pos = match.start()
                        clause_heading = match.group().strip()

                        # Look for the end of this clause (next major heading or end of text)
                        remaining_after_match = remaining_text[start_pos:]
                        next_section_match = re.search(r'\n\s*(?:article|section|clause)\s*\d+', remaining_after_match[1:], re.IGNORECASE)

                        if next_section_match:
                            end_pos = start_pos + next_section_match.start()
                            clause_content = remaining_text[start_pos:end_pos].strip()
                        else:
                            # Take reasonable amount of text after the heading
                            lines = remaining_after_match.split('\n')[:10]  # Take first 10 lines
                            clause_content = '\n'.join(lines).strip()

                        if clause_content and len(clause_content) > len(clause_heading) + 10:  # Ensure we have substantial content
                            identified_clauses.append({
                                'type': clause_type,
                                'heading': clause_heading,
                                'content': clause_content
                            })

                            # Remove this clause from remaining text to avoid duplicates
                            remaining_text = remaining_text.replace(clause_content, '', 1)
                            break  # Only take the first match for each pattern
                    else:
                        continue
                    break

            # If no clauses were identified, provide basic sentence-based extraction
            if not identified_clauses:
                sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
                for i, sentence in enumerate(sentences[:20]):  # Limit to first 20 sentences
                    identified_clauses.append({
                        'type': 'general',
                        'heading': f'Clause {i+1}',
                        'content': sentence
                    })

            # Simple risk identification: keyword search
            risk_keywords = ['risk', 'liability', 'penalty', 'breach', 'termination']
            risks = [word for word in risk_keywords if word in text.lower()]

            # Calculate classification percentages based on identified clauses
            clause_categories = {
                'definitions': ['definitions', 'defined terms'],
                'payment_terms': ['payment', 'fee', 'compensation', 'price', 'cost', 'invoice'],
                'termination': ['terminate', 'termination', 'cancel', 'cancellation', 'end'],
                'liability': ['liability', 'liable', 'responsible', 'indemnify', 'indemnification'],
                'confidentiality': ['confidential', 'confidentiality', 'secret', 'non-disclosure'],
                'intellectual_property': ['intellectual property', 'copyright', 'patent', 'trademark', 'ip'],
                'governing_law': ['governing law', 'jurisdiction', 'court', 'arbitration'],
                'warranties': ['warranty', 'warrant', 'represent', 'representation', 'guarantee']
            }

            classification = {}
            total_clauses = len(identified_clauses) if identified_clauses else 1

            for category, keywords in clause_categories.items():
                matching_clauses = sum(1 for clause in identified_clauses
                                     if any(keyword in clause['content'].lower() for keyword in keywords))
                percentage = round((matching_clauses / total_clauses) * 100, 2) if total_clauses > 0 else 0.0
                classification[category] = percentage

            analysis = {
                'summary': summary,
                'clauses': identified_clauses,
                'risks': risks,
                'classification': classification
            }
            model_versions = {"summarizer": "facebook/bart-large-cnn"}
            
            # Update progress
            self.update_state(state='PROGRESS', meta={'status': 'Saving results...', 'progress': 90})
            
        except Exception as e:
            error_msg = f"Error in analyze_document_task: {str(e)}"
            logger.error(error_msg, exc_info=True)
            # Handle token overflow or other errors gracefully in fallback
            fallback_classification = {
                'definitions': 0.0,
                'payment_terms': 0.0,
                'termination': 0.0,
                'liability': 0.0,
                'confidentiality': 0.0,
                'intellectual_property': 0.0,
                'governing_law': 0.0,
                'warranties': 0.0
            }
            analysis = {
                'summary': f'Analysis completed with warnings: {str(e)}',
                'clauses': [],
                'risks': [],
                'classification': fallback_classification
            }
            model_versions = {}
        
        processing_time = time.time() - start_time
        logger.info(f"Analysis completed in {processing_time:.2f} seconds")
        
        # Store results in MongoDB
        db_mgr = get_db_manager()
        db_mgr.store_analysis_result(doc_id, analysis, processing_time, model_versions)
        
        # Update document status
        db_mgr.update_document_status(doc_id, 'completed')
        
        result = {'document_id': doc_id, 'analysis': analysis}
        logger.info(f"Task completed successfully for document: {doc_id}")
        return result
        
    except Exception as e:
        error_msg = f"Critical error in analyze_document_task: {str(e)}"
        logger.error(error_msg, exc_info=True)
        self.update_state(state='FAILURE', meta={'error': error_msg})
        # Update document status to error
        try:
            db_mgr = get_db_manager()
            db_mgr.update_document_status(doc_id, 'error')
        except:
            pass
        raise  # Re-raise to mark task as FAILURE

@celery_app.task(bind=True)
def monitor_drift_task(self):
    # Load reference data (assume CSV with features)
    reference_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data/reference_data.csv")
    if os.path.exists(reference_path):
        reference_data = pd.read_csv(reference_path)
    else:
        # Fallback to sample data
        reference_data = pd.DataFrame({"feature1": [1, 2, 3], "feature2": [4, 5, 6]})

    # Load current data from recent analyses (simplified: sample from DB or use sample)
    # For now, use sample current data
    current_data = pd.DataFrame({"feature1": [1.1, 2.1, 3.1], "feature2": [4.1, 5.1, 6.1]})

    report = detect_drift(reference_data, current_data)
    report.save_html(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../reports/drift_report.html"))
    drift_metric = report.as_dict()['metrics'][1]['result']['drift_score']
    retrain_trigger(drift_metric)
    return {'drift_score': drift_metric, 'retrained': retrain_trigger(drift_metric, threshold=0.1)}
