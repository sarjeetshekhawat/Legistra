import json
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import logging

logger = logging.getLogger(__name__)

class SimpleDB:
    """Simple file-based database for testing when MongoDB is not available"""
    
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(__file__), 'data')
        self.users_file = os.path.join(self.data_dir, 'users.json')
        self.documents_file = os.path.join(self.data_dir, 'documents.json')
        self.analysis_file = os.path.join(self.data_dir, 'analysis.json')
        
        # Create data directory if it doesn't exist
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Initialize data files
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump({}, f)
        if not os.path.exists(self.documents_file):
            with open(self.documents_file, 'w') as f:
                json.dump({}, f)
        if not os.path.exists(self.analysis_file):
            with open(self.analysis_file, 'w') as f:
                json.dump({}, f)
    
    def _read_users(self):
        with open(self.users_file, 'r') as f:
            return json.load(f)
    
    def _write_users(self, users):
        with open(self.users_file, 'w') as f:
            json.dump(users, f, indent=2, default=str)
    
    def _read_documents(self):
        with open(self.documents_file, 'r') as f:
            return json.load(f)
    
    def _write_documents(self, documents):
        with open(self.documents_file, 'w') as f:
            json.dump(documents, f, indent=2, default=str)
    
    def _read_analysis(self):
        with open(self.analysis_file, 'r') as f:
            return json.load(f)
    
    def _write_analysis(self, analysis):
        with open(self.analysis_file, 'w') as f:
            json.dump(analysis, f, indent=2, default=str)

# Simple database instance
simple_db = SimpleDB()

class MongoDB:
    """Fallback to simple database when MongoDB is not available"""
    
    def __init__(self, uri='mongodb://localhost:27017/', db_name='legal_docs'):
        self.uri = uri
        self.db_name = db_name
        self.simple_db = simple_db
    
    def get_users_collection(self):
        return self
    
    def get_documents_collection(self):
        return self
    
    def get_analysis_results_collection(self):
        return self
    
    def get_user_sessions_collection(self):
        return self
    
    def insert_user(self, email, password, first_name=None, last_name=None):
        users = simple_db._read_users()
        
        # Check if user already exists
        for user_id, user_data in users.items():
            if user_data['email'] == email:
                return None  # User already exists
        
        # Create new user
        user_id = str(uuid.uuid4())
        users[user_id] = {
            '_id': user_id,
            'email': email,
            'password_hash': generate_password_hash(password),
            'first_name': first_name,
            'last_name': last_name,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        simple_db._write_users(users)
        return user_id
    
    def get_user_by_email(self, email):
        users = simple_db._read_users()
        for user_id, user_data in users.items():
            if user_data['email'] == email:
                return user_data
        return None
    
    def get_user_by_id(self, user_id):
        users = simple_db._read_users()
        return users.get(user_id)
    
    def insert_document(self, filename, text, file_path=None):
        documents = simple_db._read_documents()
        doc_id = str(uuid.uuid4())
        
        documents[doc_id] = {
            '_id': doc_id,
            'filename': filename,
            'content': text,
            'upload_time': datetime.utcnow().isoformat(),
            'file_size': len(text) if not file_path else os.path.getsize(file_path) if os.path.exists(file_path) else len(text),
            'file_type': filename.rsplit('.', 1)[1].lower() if '.' in filename else 'txt'
        }
        
        simple_db._write_documents(documents)
        return doc_id
    
    def get_document(self, doc_id):
        documents = simple_db._read_documents()
        return documents.get(doc_id)
    
    def update_document_with_user(self, document_id, user_id):
        documents = simple_db._read_documents()
        if document_id in documents:
            documents[document_id]['user_id'] = user_id
            simple_db._write_documents(documents)
    
    def update_analysis_result_with_user(self, analysis_id, user_id):
        analysis = simple_db._read_analysis()
        if analysis_id in analysis:
            analysis[analysis_id]['user_id'] = user_id
            simple_db._write_analysis(analysis)
    
    def insert_analysis_result(self, document_id, analysis_results, processing_time, model_versions):
        analysis = simple_db._read_analysis()
        analysis_id = str(uuid.uuid4())
        
        analysis[analysis_id] = {
            '_id': analysis_id,
            'document_id': document_id,
            'analysis_results': analysis_results,
            'processing_time': processing_time,
            'model_versions': model_versions,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'completed'
        }
        
        simple_db._write_analysis(analysis)
        return analysis_id
    
    def get_analysis_result(self, document_id):
        analysis = simple_db._read_analysis()
        for analysis_id, analysis_data in analysis.items():
            if analysis_data.get('document_id') == document_id:
                return analysis_data
        return None
    
    def get_user_documents(self, user_id):
        documents = simple_db._read_documents()
        user_docs = []
        for doc_id, doc_data in documents.items():
            if doc_data.get('user_id') == user_id:
                user_docs.append(doc_data)
        return user_docs
    
    def get_user_analysis_results(self, user_id):
        analysis = simple_db._read_analysis()
        user_analysis = []
        for analysis_id, analysis_data in analysis.items():
            if analysis_data.get('user_id') == user_id:
                user_analysis.append(analysis_data)
        return user_analysis
    
    def find_documents(self, query=None, limit=None):
        documents = simple_db._read_documents()
        results = []
        
        for doc_id, doc_data in documents.items():
            if query and 'content' in query:
                # Simple text search
                search_term = query['content'].get('$regex', '').lower()
                if search_term and search_term not in doc_data.get('content', '').lower():
                    continue
            
            results.append(doc_data)
            
            if limit and len(results) >= limit:
                break
        
        return results
    
    def count_documents(self, query=None):
        documents = simple_db._read_documents()
        if query and 'user_id' in query:
            count = sum(1 for doc in documents.values() if doc.get('user_id') == query['user_id'])
        else:
            count = len(documents)
        return count
    
    def aggregate(self, pipeline):
        analysis = simple_db._read_analysis()
        results = []
        
        # Simple aggregation for analysis counts
        if pipeline:
            match_stage = next((stage for stage in pipeline if '$match' in stage), {})
            group_stage = next((stage for stage in pipeline if '$group' in stage), {})
            
            filtered_analysis = []
            if match_stage:
                user_id = match_stage['$match'].get('user_id')
                if user_id:
                    filtered_analysis = [a for a in analysis.values() if a.get('user_id') == user_id]
            
            if group_stage:
                # Group by analysis_results
                groups = {}
                for a in filtered_analysis:
                    key = a.get('analysis_results', 'unknown')
                    groups[key] = groups.get(key, 0) + 1
                
                for key, count in groups.items():
                    results.append({'_id': key, 'count': count})
            else:
                results = filtered_analysis
        
        return results
    
    def update_document_status(self, doc_id, status):
        """Update document status - placeholder for compatibility"""
        # In simple database, we don't track document status separately
        # This is a placeholder method for compatibility
        logger.info(f"Document {doc_id} status updated to: {status}")
        return True

class DBManager:
    """Simple database manager for compatibility with existing code"""
    
    def __init__(self, mongo_db):
        self.mongo_db = mongo_db
    
    def store_document_metadata_and_content(self, filename, text, file_path=None):
        """Store document metadata and content"""
        return self.mongo_db.insert_document(filename, text, file_path)
    
    def get_document(self, doc_id):
        """Get document by ID"""
        return self.mongo_db.get_document(doc_id)
    
    def store_analysis_result(self, document_id, analysis_results, processing_time, model_versions):
        """Store analysis result"""
        return self.mongo_db.insert_analysis_result(document_id, analysis_results, processing_time, model_versions)
    
    def get_analysis_result(self, document_id):
        """Get analysis result by document ID"""
        return self.mongo_db.get_analysis_result(document_id)
    
    def update_document_status(self, doc_id, status):
        """Update document status - placeholder for compatibility"""
        return self.mongo_db.update_document_status(doc_id, status)
