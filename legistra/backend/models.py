from datetime import datetime
from pymongo import MongoClient
import os
import uuid

# MongoDB Collections Helper
class MongoDB:
    def __init__(self, uri='mongodb://localhost:27017/', db_name='legal_docs'):
        self.client = MongoClient(uri)
        self.db = self.client[db_name]

    def get_documents_collection(self):
        return self.db.documents

    def get_analysis_results_collection(self):
        return self.db.analysis_results

    def get_user_sessions_collection(self):
        return self.db.user_sessions

    def insert_document(self, filename, text, file_path=None):
        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'txt'
        document = {
            '_id': str(uuid.uuid4()),
            'filename': filename,
            'upload_time': datetime.utcnow(),
            'file_size': os.path.getsize(file_path) if file_path else len(text),
            'text_length': len(text),
            'status': 'uploaded',  # uploaded, processing, completed, error
            'document_type': ext,  # pdf, doc, docx, txt
            'file_path': file_path,
            'content': text
        }
        result = self.get_documents_collection().insert_one(document)
        return document['_id']

    def get_document(self, document_id):
        return self.get_documents_collection().find_one({'_id': document_id})

    def update_document_status(self, document_id, status):
        self.get_documents_collection().update_one({'_id': document_id}, {'$set': {'status': status}})

    def insert_analysis_result(self, document_id, analysis_results, processing_time, model_versions):
        analysis_doc = {
            '_id': str(uuid.uuid4()),
            'document_id': document_id,
            'analysis_timestamp': datetime.utcnow(),
            'analysis_results': analysis_results,
            'status': 'completed',
            'processing_time': processing_time,
            'model_versions': model_versions
        }
        result = self.get_analysis_results_collection().insert_one(analysis_doc)
        return analysis_doc['_id']

    def get_analysis_result(self, document_id):
        return self.get_analysis_results_collection().find_one({'document_id': document_id})

    def insert_user_session(self, session_token):
        session_doc = {
            '_id': str(uuid.uuid4()),
            'session_token': session_token,
            'created_at': datetime.utcnow(),
            'last_activity': datetime.utcnow()
        }
        result = self.get_user_sessions_collection().insert_one(session_doc)
        return session_doc['_id']

    def get_user_session(self, session_token):
        return self.get_user_sessions_collection().find_one({'session_token': session_token})

    def update_user_session_activity(self, session_token):
        self.get_user_sessions_collection().update_one(
            {'session_token': session_token},
            {'$set': {'last_activity': datetime.utcnow()}}
        )

# DB Manager
class DBManager:
    def __init__(self, mongo_db):
        self.mongo_db = mongo_db

    def store_document_metadata_and_content(self, filename, text, file_path=None):
        return self.mongo_db.insert_document(filename, text, file_path)

    def get_document(self, document_id):
        return self.mongo_db.get_document(document_id)

    def update_document_status(self, document_id, status):
        self.mongo_db.update_document_status(document_id, status)

    def store_analysis_result(self, document_id, analysis_results, processing_time, model_versions):
        return self.mongo_db.insert_analysis_result(document_id, analysis_results, processing_time, model_versions)

    def get_analysis_result(self, document_id):
        return self.mongo_db.get_analysis_result(document_id)

# Global instances will be initialized in app.py
