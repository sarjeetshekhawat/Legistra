import sys
import os
path_to_add = os.path.join(os.path.dirname(__file__), '..')
print(f"Adding path: {path_to_add}")
sys.path.append(path_to_add)

from models_supabase import SupabaseDB, DBManager
from config import config
import logging
import time

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
        mongo_db = SupabaseDB()
        db_manager = DBManager(mongo_db)
    return db_manager

def analyze_document_ml_sync(doc_id):
    """
    Synchronous version of the ML analysis task (without Celery dependencies)
    """
    logger.info(f"Starting ML analysis for document: {doc_id}")
    
    try:
        db_mgr = get_db_manager()
        document = db_mgr.get_document(doc_id)
        if not document:
            error_msg = f'Document not found: {doc_id}'
            logger.error(error_msg)
            return {'error': error_msg}
        
        logger.info(f"Document found, content length: {len(document.get('content', ''))}")
        text = document['content']
        start_time = time.time()
        
        # Use tokenizer to truncate text to model max length tokens (1024 tokens)
        logger.info(f"Original text length (chars): {len(text)}")
        from transformers import AutoTokenizer
        tokenizer = AutoTokenizer.from_pretrained("facebook/bart-large-cnn")
        max_tokens = 1024
        tokens = tokenizer.encode(text, truncation=True, max_length=max_tokens)
        logger.info(f"Tokenized input length after truncation: {len(tokens)}")
        truncated_text = tokenizer.decode(tokens, skip_special_tokens=True)
        logger.info(f"Truncated text length (chars): {len(truncated_text)}")
        
        # Generate summary
        from transformers import pipeline
        summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
        summary = summarizer(truncated_text, max_length=150, min_length=30, do_sample=False)[0]['summary_text']
        
        # Advanced clause extraction and identification
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
                        end_pos = start_pos + next_section_match.start() + 1
                    else:
                        end_pos = len(remaining_text)

                    clause_text = remaining_text[start_pos:end_pos].strip()
                    
                    # Clean up the clause text
                    clause_text = re.sub(r'\n+', ' ', clause_text)
                    clause_text = re.sub(r'\s+', ' ', clause_text)

                    if len(clause_text) > 50:  # Only include substantial clauses
                        identified_clauses.append({
                            'type': clause_type,
                            'heading': clause_heading,
                            'content': clause_text[:500] + '...' if len(clause_text) > 500 else clause_text
                        })

        # Remove duplicates and limit to top clauses
        unique_clauses = []
        seen_headings = set()
        for clause in identified_clauses:
            heading_key = clause['heading'].lower().strip()
            if heading_key not in seen_headings:
                unique_clauses.append(clause)
                seen_headings.add(heading_key)

        identified_clauses = unique_clauses[:10]  # Limit to top 10 clauses

        # Generate risk assessment based on identified clauses
        risks = []
        clause_types = [clause['type'] for clause in identified_clauses]
        
        if 'termination' in clause_types:
            risks.append('Termination clauses detected - review termination conditions')
        if 'liability' in clause_types:
            risks.append('Liability limitation clauses - review liability caps')
        if 'confidentiality' in clause_types:
            risks.append('Confidentiality obligations - ensure compliance')
        if 'payment_terms' in clause_types:
            risks.append('Payment terms - verify payment schedule')
        if 'dispute_resolution' in clause_types:
            risks.append('Dispute resolution clause - arbitration required')

        # Generate classification summary
        classification_counts = {}
        for clause_type in clause_types:
            classification_counts[clause_type] = classification_counts.get(clause_type, 0) + 1
        
        total_clauses = len(classification_counts)
        classification_percentages = {
            k: (v / total_clauses * 100) if total_clauses > 0 else 0 
            for k, v in classification_counts.items()
        }

        processing_time = time.time() - start_time
        logger.info(f"Analysis completed in {processing_time:.2f} seconds")
        
        # Store results in MongoDB
        analysis = {
            'summary': summary,
            'clauses': identified_clauses,
            'classification': classification_percentages,
            'risks': risks,
            'processing_time': processing_time,
            'model_versions': {
                'summarizer': 'facebook/bart-large-cnn',
                'tokenizer': 'facebook/bart-large-cnn'
            }
        }
        
        # Store results in MongoDB
        db_mgr = get_db_manager()
        db_mgr.store_analysis_result(doc_id, analysis, processing_time, {
            'summarizer': 'facebook/bart-large-cnn',
            'tokenizer': 'facebook/bart-large-cnn'
        })
        
        # Update document status
        db_mgr.update_document_status(doc_id, 'completed')
        
        result = {'document_id': doc_id, 'analysis': analysis}
        logger.info(f"ML analysis completed successfully for document: {doc_id}")
        return result
        
    except Exception as e:
        error_msg = f"Critical error in ML analysis: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Update document status to error if possible
        try:
            db_mgr = get_db_manager()
            db_mgr.update_document_status(doc_id, 'error')
        except:
            pass
        
        return {'error': error_msg}
