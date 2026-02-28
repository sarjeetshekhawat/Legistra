import pytest
import os
import tempfile
from app import app


@pytest.fixture
def client():
    app.config['SUPABASE_URL'] = os.getenv('SUPABASE_URL', 'https://test-project.supabase.co')
    app.config['SUPABASE_KEY'] = os.getenv('SUPABASE_KEY', 'test-key')
    app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
    with app.test_client() as client:
        yield client
