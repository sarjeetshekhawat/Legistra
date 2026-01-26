import sys
import os
path_to_add = os.path.join(os.path.dirname(__file__), '..')
print(f"Adding path: {path_to_add}")
sys.path.append(path_to_add)

from models_simple import MongoDB, DBManager, simple_db
from config import config
import logging
import time
import re
from langdetect import detect
import threading
from transformers import AutoTokenizer, pipeline

# Set up logging for tasks
logger = logging.getLogger(__name__)

# Get environment from env variable
env = os.getenv('FLASK_ENV', 'development')

# Initialize MongoDB connection (will be recreated in task if needed)
mongo_db = None
db_manager = None

# Global model cache to avoid reloading
_model_cache = {}
_model_cache_lock = threading.Lock()

def get_cached_model(model_name):
    """Get or create cached model to avoid reloading"""
    with _model_cache_lock:
        if model_name not in _model_cache:
            logger.info(f"Loading model: {model_name}")
            try:
                _model_cache[model_name] = pipeline("summarization", model=model_name)
                logger.info(f"Model {model_name} loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {str(e)}")
                raise
        return _model_cache[model_name]

def get_db_manager():
    """Get or create DB manager instance"""
    global mongo_db, db_manager
    if mongo_db is None or db_manager is None:
        mongo_db = MongoDB(uri=config[env].MONGODB_URI, db_name=config[env].MONGO_DB)
        db_manager = DBManager(mongo_db)
    return db_manager

def get_document_from_simple_db(doc_id):
    """Get document from simple_db instance"""
    all_docs = simple_db._read_documents()
    if doc_id in all_docs:
        return all_docs[doc_id]
    return None

def detect_language(text):
    """Detect the language of the document text"""
    try:
        if not text or len(text.strip()) < 50:
            return 'en'  # Default to English for very short text
        
        detected = detect(text)
        logger.info(f"Detected language: {detected}")
        
        # Map detected language to our supported languages
        language_map = {
            'en': 'english',
            'hi': 'hindi',
            'mr': 'marathi',
            'ne': 'nepali',  # Nepali is similar to Hindi
            'pa': 'punjabi',  # Punjabi can use similar models
        }
        
        return language_map.get(detected, 'english')
    except Exception as e:
        logger.warning(f"Language detection failed: {str(e)}, defaulting to English")
        return 'english'

def get_multilingual_model(language):
    """Get the appropriate summarization model for the detected language"""
    models = {
        'english': {
            'tokenizer': 'facebook/bart-large-cnn',
            'summarizer': 'facebook/bart-large-cnn',
            'max_length': 150,
            'min_length': 30
        },
        'hindi': {
            'tokenizer': 'facebook/bart-large-cnn',  # Use English model for Hindi
            'summarizer': 'facebook/bart-large-cnn',
            'max_length': 200,
            'min_length': 40
        },
        'marathi': {
            'tokenizer': 'facebook/bart-large-cnn',  # Use English model for Marathi
            'summarizer': 'facebook/bart-large-cnn',
            'max_length': 200,
            'min_length': 40
        }
    }
    
    return models.get(language, models['english'])

def preprocess_multilingual_text(text, language):
    """Preprocess text based on language"""
    if not text:
        return text
    
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text.strip())
    
    # Language-specific preprocessing
    if language == 'hindi':
        # Hindi text preprocessing
        text = re.sub(r'[।॥]', '.', text)  # Replace Hindi punctuation
    elif language == 'marathi':
        # Marathi text preprocessing
        text = re.sub(r'[।॥]', '.', text)  # Replace Marathi punctuation
    
    return text

def analyze_document_multilingual_sync(doc_id):
    """
    Multilingual document analysis supporting Hindi, Marathi, and English
    """
    logger.info(f"Starting multilingual ML analysis for document: {doc_id}")
    
    try:
        db_mgr = get_db_manager()
        document = get_document_from_simple_db(doc_id)
        if not document:
            error_msg = f'Document not found: {doc_id}'
            logger.error(error_msg)
            return {'error': error_msg}
        
        logger.info(f"Document found, content length: {len(document.get('content', ''))}")
        text = document['content']
        start_time = time.time()
        
        # Step 1: Detect language
        logger.info("Detecting document language...")
        detected_language = detect_language(text)
        logger.info(f"Document language detected as: {detected_language}")
        
        # Step 2: Preprocess text based on language
        logger.info(f"Preprocessing {detected_language} text...")
        processed_text = preprocess_multilingual_text(text, detected_language)
        
        # Step 3: Get appropriate model for the language
        logger.info(f"Loading {detected_language} summarization model...")
        model_config = get_multilingual_model(detected_language)
        
        # Step 4: Tokenize and truncate text
        logger.info(f"Original text length (chars): {len(processed_text)}")
        tokenizer = AutoTokenizer.from_pretrained(model_config['tokenizer'])
        max_tokens = 1024
        tokens = tokenizer.encode(processed_text, truncation=True, max_length=max_tokens)
        logger.info(f"Tokenized input length after truncation: {len(tokens)}")
        truncated_text = tokenizer.decode(tokens, skip_special_tokens=True)
        logger.info(f"Truncated text length (chars): {len(truncated_text)}")
        
        # Step 5: Generate summary in the detected language
        logger.info(f"Generating {detected_language} summary...")
        try:
            # Use cached model for faster processing
            summarizer = get_cached_model(model_config['summarizer'])
            
            # Reduce input size for faster processing
            max_input_length = 512  # Reduced from 1024
            tokens = tokenizer.encode(processed_text, truncation=True, max_length=max_input_length)
            truncated_text = tokenizer.decode(tokens, skip_special_tokens=True)
            
            # Generate summary with reduced parameters for speed
            summary = summarizer(
                truncated_text, 
                max_length=min(model_config['max_length'], 100),  # Reduced max length
                min_length=min(model_config['min_length'], 20),   # Reduced min length
                do_sample=False,
                num_beams=1  # Reduced beams for speed
            )[0]['summary_text']
        except Exception as model_error:
            logger.warning(f"Language-specific model failed: {str(model_error)}, falling back to English model")
            # Fallback to English model with cached version
            summarizer = get_cached_model("facebook/bart-large-cnn")
            summary = summarizer(
                truncated_text, 
                max_length=80, 
                min_length=20, 
                do_sample=False,
                num_beams=1
            )[0]['summary_text']
        
        logger.info(f"Generated summary: {summary[:100]}...")
        
        # Step 6: Advanced clause extraction (language-agnostic patterns)
        logger.info("Extracting legal clauses...")
        
        # Define clause patterns that work across languages
        clause_patterns = {
            'confidentiality': [
                r'(?i)(?:article|section|clause|धार|अनुच्छेद)\s*\d*\.?\s*(?:confidentiality|confidential|non-disclosure|nda|गोपनीयता|गुप्तता)',
                r'(?i)confidentiality\s*(?:agreement|clause|provision|समझौता|धार)',
                r'(?i)non-disclosure\s*(?:agreement|clause|provision|समझौता|धार)',
                r'(?i)गोपनीयता\s*(?:समझौता|धार|प्रावधान)',
                r'(?i)गुप्तता\s*(?:समझौता|धार|प्रावधान)'
            ],
            'indemnity': [
                r'(?i)(?:article|section|clause|धार|अनुच्छेद)\s*\d*\.?\s*(?:indemnity|indemnification|क्षतिपूर्ति|हर्जाना)',
                r'(?i)indemnity\s*(?:clause|provision|agreement|धार|समझौता)',
                r'(?i)indemnification\s*(?:clause|provision|agreement|धार|समझौता)',
                r'(?i)क्षतिपूर्ति\s*(?:धार|प्रावधान|समझौता)',
                r'(?i)हर्जाना\s*(?:धार|प्रावधान|समझौता)'
            ],
            'liability': [
                r'(?i)(?:article|section|clause|धार|अनुच्छेद)\s*\d*\.?\s*(?:liability|limitation of liability|दायित्व|जिम्मेदारी)',
                r'(?i)liability\s*(?:clause|provision|limitation|धार|प्रावधान)',
                r'(?i)limitation\s*of\s*liability',
                r'(?i)दायित्व\s*(?:धार|प्रावधान|सीमा)',
                r'(?i)जिम्मेदारी\s*(?:धार|प्रावधान|सीमा)'
            ],
            'termination': [
                r'(?i)(?:article|section|clause|धार|अनुच्छेद)\s*\d*\.?\s*(?:termination|termination of agreement|समाप्ति|अंत)',
                r'(?i)termination\s*(?:clause|provision|rights|conditions|धार|अधिकार|शर्त)',
                r'(?i)term\s*and\s*termination',
                r'(?i)समाप्ति\s*(?:धार|अधिकार|शर्त|समझौता)',
                r'(?i)अंत\s*(?:धार|अधिकार|शर्त|समझौता)'
            ],
            'payment_terms': [
                r'(?i)(?:article|section|clause|धार|अनुच्छेद)\s*\d*\.?\s*(?:payment|compensation|fees|भुगतानी|प्रतिपूर्ति)',
                r'(?i)payment\s*(?:terms|conditions|schedule|शर्त|नियम|समय)',
                r'(?i)compensation\s*(?:clause|provision|धार|प्रावधान)',
                r'(?i)भुगतानी\s*(?:शर्त|नियम|समय|धार)',
                r'(?i)प्रतिपूर्ति\s*(?:धार|प्रावधान|शर्त)'
            ],
            'governing_law': [
                r'(?i)(?:article|section|clause|धार|अनुच्छेद)\s*\d*\.?\s*(?:governing law|governing law and jurisdiction|शासन कानून|न्यायक्षेत्र)',
                r'(?i)governing\s*(?:law|jurisdiction|कानून|न्यायक्षेत्र)',
                r'(?i)applicable\s*law',
                r'(?i)शासन\s*कानून',
                r'(?i)न्यायक्षेत्र'
            ]
        }

        # Split text into paragraphs for better clause identification
        paragraphs = re.split(r'\n\s*\n|\n(?=[A-Z][^a-z]*:|\d+\.)', processed_text)

        identified_clauses = []
        remaining_text = processed_text

        # Find and extract each type of clause
        for clause_type, patterns in clause_patterns.items():
            for pattern in patterns:
                matches = list(re.finditer(pattern, remaining_text, re.IGNORECASE))
                for match in matches:
                    # Find the clause boundaries
                    start_pos = match.start()
                    clause_heading = match.group().strip()

                    # Look for the end of this clause
                    remaining_after_match = remaining_text[start_pos:]
                    next_section_match = re.search(r'\n\s*(?:article|section|clause|धार|अनुच्छेद)\s*\d+', remaining_after_match[1:], re.IGNORECASE)

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
                            'content': clause_text[:500] + '...' if len(clause_text) > 500 else clause_text,
                            'language': detected_language
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
            risks.append(f'Termination clauses detected - review termination conditions ({detected_language})')
        if 'liability' in clause_types:
            risks.append(f'Liability limitation clauses - review liability caps ({detected_language})')
        if 'confidentiality' in clause_types:
            risks.append(f'Confidentiality obligations - ensure compliance ({detected_language})')
        if 'payment_terms' in clause_types:
            risks.append(f'Payment terms - verify payment schedule ({detected_language})')

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
        logger.info(f"Multilingual analysis completed in {processing_time:.2f} seconds")
        
        # Store results in MongoDB
        analysis = {
            'summary': summary,
            'language': detected_language,
            'clauses': identified_clauses,
            'classification': classification_percentages,
            'risks': risks,
            'processing_time': processing_time,
            'model_versions': {
                'summarizer': model_config['summarizer'],
                'tokenizer': model_config['tokenizer'],
                'language': detected_language
            }
        }
        
        # Store results in MongoDB
        db_mgr = get_db_manager()
        db_mgr.store_analysis_result(doc_id, analysis, processing_time, {
            'summarizer': model_config['summarizer'],
            'tokenizer': model_config['tokenizer'],
            'language': detected_language
        })
        
        # Update document status
        db_mgr.update_document_status(doc_id, 'completed')
        
        result = {
            'document_id': doc_id, 
            'analysis': analysis,
            'language_info': {
                'detected_language': detected_language,
                'supported_languages': ['english', 'hindi', 'marathi'],
                'model_used': model_config['summarizer']
            }
        }
        
        logger.info(f"Multilingual ML analysis completed successfully for document: {doc_id}")
        return result
        
    except Exception as e:
        error_msg = f"Critical error in multilingual ML analysis: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Update document status to error if possible
        try:
            db_mgr = get_db_manager()
            db_mgr.update_document_status(doc_id, 'error')
        except:
            pass
        
        return {'error': error_msg}

def analyze_document_fast_multilingual_sync(doc_id):
    """
    Fast multilingual document analysis with optimized performance
    """
    logger.info(f"Starting FAST multilingual ML analysis for document: {doc_id}")
    
    try:
        db_mgr = get_db_manager()
        document = get_document_from_simple_db(doc_id)
        if not document:
            error_msg = f'Document not found: {doc_id}'
            logger.error(error_msg)
            return {'error': error_msg}
        
        logger.info(f"Document found, content length: {len(document.get('content', ''))}")
        text = document['content']
        start_time = time.time()
        
        # Step 1: Quick language detection
        logger.info("Detecting document language...")
        detected_language = detect_language(text)
        logger.info(f"Document language detected as: {detected_language}")
        
        # Step 2: Quick text preprocessing
        logger.info(f"Preprocessing {detected_language} text...")
        processed_text = preprocess_multilingual_text(text, detected_language)
        
        # Step 3: Fast summary generation (using extractive summarization)
        logger.info(f"Generating fast {detected_language} summary...")
        
        # Simple extractive summarization for speed
        sentences = re.split(r'[.!?।॥]', processed_text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        # Take first few sentences as summary
        summary_sentences = sentences[:3]
        summary = '. '.join(summary_sentences) + '.'
        
        if len(summary) < 50 and len(sentences) > 3:
            summary = '. '.join(sentences[:5]) + '.'
        
        logger.info(f"Generated fast summary: {summary[:100]}...")
        
        # Step 4: Fast clause extraction (reduced patterns)
        logger.info("Extracting legal clauses (fast mode)...")
        
        # Simplified clause patterns for speed
        fast_clause_patterns = {
            'confidentiality': [
                r'(?i)(?:confidential|गोपनीय|गुप्त)',
                r'(?i)(?:non-disclosure|nda)',
            ],
            'termination': [
                r'(?i)(?:termination|समाप्ति|अंत)',
                r'(?i)(?:terminate|end)',
            ],
            'payment': [
                r'(?i)(?:payment|भुगतानी|भरणे)',
                r'(?i)(?:fee|cost|amount)',
            ],
            'liability': [
                r'(?i)(?:liability|दायित्व|जिम्मेदारी)',
                r'(?i)(?:responsible|liable)',
            ]
        }

        # Fast clause identification
        identified_clauses = []
        remaining_text = processed_text

        # Find and extract each type of clause (limited to first match per type)
        for clause_type, patterns in fast_clause_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, remaining_text, re.IGNORECASE)
                if match:
                    start_pos = match.start()
                    
                    # Extract a small context around the match
                    context_start = max(0, start_pos - 50)
                    context_end = min(len(remaining_text), start_pos + 200)
                    clause_text = remaining_text[context_start:context_end].strip()
                    
                    clause_text = re.sub(r'\n+', ' ', clause_text)
                    clause_text = re.sub(r'\s+', ' ', clause_text)

                    if len(clause_text) > 30:
                        identified_clauses.append({
                            'type': clause_type,
                            'heading': f"{clause_type.title()} Clause",
                            'content': clause_text[:300] + '...' if len(clause_text) > 300 else clause_text,
                            'language': detected_language
                        })
                    break  # Only take first match per type for speed

        # Limit to top 5 clauses for speed
        identified_clauses = identified_clauses[:5]

        # Generate simple risk assessment
        risks = []
        clause_types = [clause['type'] for clause in identified_clauses]
        
        risk_messages = {
            'confidentiality': f'Confidentiality obligations detected ({detected_language})',
            'termination': f'Termination clauses detected - review conditions ({detected_language})',
            'payment': f'Payment terms identified - verify schedule ({detected_language})',
            'liability': f'Liability clauses found - review limits ({detected_language})'
        }
        
        for clause_type in clause_types:
            if clause_type in risk_messages:
                risks.append(risk_messages[clause_type])

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
        logger.info(f"Fast multilingual analysis completed in {processing_time:.2f} seconds")
        
        # Store results in MongoDB
        analysis = {
            'summary': summary,
            'language': detected_language,
            'clauses': identified_clauses,
            'classification': classification_percentages,
            'risks': risks,
            'processing_time': processing_time,
            'analysis_type': 'fast_multilingual',
            'model_versions': {
                'summarizer': 'extractive',
                'language': detected_language
            }
        }
        
        # Store results in MongoDB
        db_mgr = get_db_manager()
        db_mgr.store_analysis_result(doc_id, analysis, processing_time, {
            'summarizer': 'extractive',
            'language': detected_language,
            'analysis_type': 'fast_multilingual'
        })
        
        # Update document status
        db_mgr.update_document_status(doc_id, 'completed')
        
        result = {
            'document_id': doc_id, 
            'analysis': analysis,
            'language_info': {
                'detected_language': detected_language,
                'supported_languages': ['english', 'hindi', 'marathi'],
                'model_used': 'extractive_summarization',
                'analysis_type': 'fast'
            }
        }
        
        logger.info(f"Fast multilingual ML analysis completed successfully for document: {doc_id}")
        return result
        
    except Exception as e:
        error_msg = f"Critical error in fast multilingual ML analysis: {str(e)}"
        logger.error(error_msg, exc_info=True)
        
        # Update document status to error if possible
        try:
            db_mgr = get_db_manager()
            db_mgr.update_document_status(doc_id, 'error')
        except:
            pass
        
        return {'error': error_msg}
