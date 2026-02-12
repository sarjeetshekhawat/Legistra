# Usage Guide for Legistra

This guide explains how to use the Legal Document Analyzer system, including backend integration, running analysis tasks, and monitoring.

## Running the Backend

The backend is a Flask application with Celery for asynchronous task processing.

### Starting the Backend

1. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

2. Start the Flask app:

```bash
python backend/app.py
```

3. Start the Celery worker:

```bash
celery -A backend.celery_app.celery_app worker --loglevel=info
```

## Analyzing Documents

Documents are analyzed asynchronously using Celery tasks.

- Use the `analyze_document_task` Celery task in `backend/tasks.py`.
- This task loads the document from the database, runs the RAG pipeline, and stores analysis results.

Example:

```python
from backend.tasks import analyze_document_task

result = analyze_document_task.delay(document_id)
```

## Monitoring and Retraining

Production monitoring is implemented using drift detection in `ml/monitoring/drift_detection.py`.

- Drift reports are generated comparing reference and current data.
- If drift exceeds a threshold, retraining is triggered automatically.

### Integration in Backend

- Drift detection can be scheduled as a periodic task.
- Retraining calls the training pipeline script.

## RAG Pipeline Usage

The RAG pipeline (`ml/pipelines/rag_pipeline.py`) combines retrieval and generation for document analysis.

Example:

```python
from ml.pipelines.rag_pipeline import RAGPipeline

rag = RAGPipeline(retriever_model, generator_model, index_path)
analysis = rag.analyze(document_text)
```

## Model Registry

Use `ml/models/registry.py` to load and manage model versions.

Example:

```python
from ml.models.registry import ModelRegistry

registry = ModelRegistry()
model = registry.load_model("legal_summarizer", version="1")
```

## Best Practices

- Monitor system performance and drift regularly.
- Update models as needed based on drift detection.
- Use the frontend for user-friendly document upload and analysis.
