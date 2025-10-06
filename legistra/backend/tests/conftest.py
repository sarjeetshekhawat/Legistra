import pytest
import os
import tempfile
from app import app

@pytest.fixture
def client():
    app.config['MONGODB_URI'] = 'mongodb+srv://Sarjeet:1404@1.1locgnd.mongodb.net/?retryWrites=true&w=majority&appName=1'
    app.config['MONGO_DB'] = 'test_legal_docs'
    app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
    with app.test_client() as client:
        yield client
