# TODO: AI/ML Model Development and Automation Workflows for Legal Document Analyzer

## Project Structure Setup
- [x] Create `ml/` directory with subdirs: `data/`, `models/`, `scripts/`, `pipelines/`, `monitoring/`
- [x] Create `notebooks/` directory for experimentation
- [x] Create `docs/` directory for documentation

## Dependencies Update
- [x] Update `backend/requirements.txt` with additional ML libraries: datasets, accelerate, peft, mlflow, evaluate, wandb, dvc, evidently, scikit-learn, nltk, etc.

## Dataset Preparation
- [x] Implement `ml/data/download_datasets.py` to download CUAD and LEDGAR datasets
- [x] Implement `ml/data/preprocess_datasets.py` to preprocess for summarization, clause extraction, risk classification tasks

## Model Fine-Tuning
- [x] Implement `ml/models/fine_tune_summarization.py` for Legal-BERT, BART, T5, Pegasus
- [x] Implement `ml/models/fine_tune_clause_extraction.py` for clause extraction
- [x] Implement `ml/models/fine_tune_risk_classification.py` for risk classification

## Embedding Model Comparison
- [x] Implement `ml/models/compare_embeddings.py` to evaluate Legal-BERT, Sentence-BERT for retrieval

## RAG Pipeline
- [x] Implement `ml/pipelines/rag_pipeline.py` using retriever (embeddings + FAISS) and generator (fine-tuned model)

## Training Pipelines with Tracking
- [x] Develop training/validation/evaluation pipelines in `ml/scripts/train_pipeline.py` with experiment tracking (MLflow/Wandb)
- [x] Integrate efficiency techniques: LoRA, PEFT, mixed-precision, quantization

## Model Registry
- [x] Set up model registry using MLflow in `ml/models/registry.py` for versioning artifacts, configs, results

## Monitoring
- [x] Implement monitoring in `ml/monitoring/drift_detection.py` using Evidently for drift detection and retraining triggers

## Backend Integration
- [x] Update `backend/tasks.py` to replace stub with real ML models for analysis (load models, perform RAG, etc.)

## Documentation
- [x] Generate documentation in `docs/training_guide.md`, `docs/evaluation_guide.md`, `docs/usage_guide.md`

## Testing and Integration
- [x] Test integration with Flask backend via Celery tasks
- [x] End-to-end testing of ML workflows
- [x] Set up monitoring in production
