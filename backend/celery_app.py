import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from celery import Celery
from config import config

# Get environment from env variable, default to development
env = os.getenv('FLASK_ENV', 'development')

# Create Celery app with proper broker and backend URLs
celery_app = Celery(
    'legal_document_analyzer',
    broker=config[env].REDIS_URL,
    backend=config[env].REDIS_URL,
    include=['tasks']
)

# Configure Celery
celery_app.conf.update(
    result_expires=3600,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    # Task routing - send tasks to celery queue
    task_routes={
        'tasks.*': {'queue': 'celery'},
    },
    # Result backend settings - remove problematic Redis-specific settings
    result_backend_transport_options={
        'visibility_timeout': 3600,
    },
)

# Import tasks to register them with the worker
# This must happen AFTER celery_app is created
import tasks
