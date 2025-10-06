import sys
import os
sys.path.append('legistra/backend')

from legistra.backend.models import MongoDB, DBManager
from legistra.backend.config import config

env = 'development'
mongo_db = MongoDB(uri=config[env].MONGODB_URI, db_name=config[env].MONGO_DB)
db_manager = DBManager(mongo_db)

# Get all documents
documents = db_manager.get_all_documents()
print(f'Found {len(documents)} documents:')
for doc in documents:
    print(f'- {doc["filename"]} (ID: {doc["_id"]})')
