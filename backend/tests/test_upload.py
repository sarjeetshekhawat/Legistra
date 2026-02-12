import io
import os
import pytest
from tasks import analyze_document_task

def test_upload_success(client):
    data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 200
    assert 'document_id' in resp.json

def test_upload_no_file(client):
    resp = client.post('/api/upload-document', data={}, content_type='multipart/form-data')
    assert resp.status_code == 400
    assert resp.json['error'] == 'No file provided'

def test_upload_invalid_extension(client):
    data = {'file': (io.BytesIO(b"dummy content"), 'file.exe')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 400
    assert resp.json['error'] == 'Invalid file type'

def test_upload_file_too_large(client):
    large_content = b'a' * (10 * 1024 * 1024 + 1)  # 10MB + 1 byte
    data = {'file': (io.BytesIO(large_content), 'large.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 413  # Flask returns 413 for oversized files

def test_analyze_nonexistent(client):
    resp = client.post('/api/analyze-document', json={'document_id':'dummy'})
    assert resp.status_code == 404

def test_analyze_success(client):
    # First upload a document
    data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 200
    doc_id = resp.json['document_id']
    # Now analyze it
    resp = client.post('/api/analyze-document', json={'document_id': doc_id})
    assert resp.status_code == 202
    assert 'task_id' in resp.json
    assert resp.json['status'] == 'processing'

def test_task_status(client):
    # First upload and analyze a document
    data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 200
    doc_id = resp.json['document_id']
    resp = client.post('/api/analyze-document', json={'document_id': doc_id})
    assert resp.status_code == 202
    task_id = resp.json['task_id']
    # Check initial status
    resp = client.get(f'/api/task-status/{task_id}')
    assert resp.status_code == 200
    assert resp.json['state'] in ['PENDING', 'PROGRESS', 'SUCCESS']
    # Wait for completion (task takes 2s)
    import time
    time.sleep(3)
    resp = client.get(f'/api/task-status/{task_id}')
    assert resp.status_code == 200
    assert resp.json['state'] == 'SUCCESS'
    assert 'result' in resp.json
    assert 'document_id' in resp.json['result']
    assert 'analysis' in resp.json['result']

def test_analyze_document_task():
    # Upload a document first to get a doc_id
    from app import app
    with app.test_client() as client:
        data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
        resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
        assert resp.status_code == 200
        doc_id = resp.json['document_id']
    # Run the task synchronously
    result = analyze_document_task.apply(args=[doc_id])
    assert result.successful()
    assert 'document_id' in result.result
    assert 'analysis' in result.result
    assert 'summary' in result.result['analysis']
    assert 'clauses' in result.result['analysis']
    assert 'risks' in result.result['analysis']

def test_search_documents(client):
    # Test missing query
    resp = client.post('/api/search-documents', json={})
    assert resp.status_code == 400
    assert resp.json['error'] == 'Missing search query'
    # Test with query (stub returns empty)
    resp = client.post('/api/search-documents', json={'query': 'test'})
    assert resp.status_code == 200
    assert resp.json['results'] == []

def test_dashboard_stats(client):
    # Upload a document first
    data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 200
    # Get stats
    resp = client.get('/api/dashboard-stats')
    assert resp.status_code == 200
    assert 'total_documents' in resp.json
    assert 'recent_uploads' in resp.json
    assert 'analysis_counts' in resp.json

def test_export_analysis(client):
    # Upload and analyze a document
    data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 200
    doc_id = resp.json['document_id']
    resp = client.post('/api/analyze-document', json={'document_id': doc_id})
    assert resp.status_code == 202
    # Export (stub)
    resp = client.post('/api/export-analysis', json={'document_id': doc_id})
    assert resp.status_code == 200
    # Test missing document_id
    resp = client.post('/api/export-analysis', json={})
    assert resp.status_code == 400
    assert resp.json['error'] == 'Missing document_id'

def test_list_documents(client):
    # Upload a document
    data = {'file': (open('tests/sample.txt','rb'), 'sample.txt')}
    resp = client.post('/api/upload-document', data=data, content_type='multipart/form-data')
    assert resp.status_code == 200
    # List documents
    resp = client.get('/api/documents')
    assert resp.status_code == 200
    assert 'documents' in resp.json
    assert 'total' in resp.json
    assert 'page' in resp.json
    assert 'per_page' in resp.json
