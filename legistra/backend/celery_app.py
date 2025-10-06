import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from celery import Celery
from config import config

env = 'development'  # or from env
celery_app = Celery('legal_document_analyzer', broker=config[env].REDIS_URL, backend=config[env].REDIS_URL)

celery_app.conf.update(
    result_expires=3600,
)

# Import tasks to register them with the worker
import tasks
