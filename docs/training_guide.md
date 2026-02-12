# Training Guide for Legistra ML Pipeline

This guide explains how to train the machine learning models used in the Legal Document Analyzer, including summarization, clause extraction, and risk classification models.

## Prerequisites

- Python 3.8+
- Installed dependencies from `backend/requirements.txt`
- Downloaded and preprocessed datasets (see `ml/data/download_datasets.py` and `ml/data/preprocess_datasets.py`)

## Training Scripts

The main training script is located at `ml/scripts/train_pipeline.py`. It supports:

- LoRA (Low-Rank Adaptation) for efficient fine-tuning
- Mixed precision training (FP16)
- Experiment tracking with MLflow and Weights & Biases (Wandb)
- Model saving and versioning

### Key Functions

- `train_with_tracking(model, tokenizer, dataset, output_dir, use_lora=True, use_wandb=True, use_mlflow=True)`: Trains a model with optional tracking and LoRA.

### Training Arguments

- `output_dir`: Directory to save the trained model
- `evaluation_strategy`: "epoch" for evaluation after each epoch
- `learning_rate`: 2e-5 (default)
- `per_device_train_batch_size`: 8 (adjust based on GPU memory)
- `num_train_epochs`: 3 (default)
- `fp16`: True for mixed precision

### Example Usage

```python
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from datasets import load_from_disk
from ml.scripts.train_pipeline import train_with_tracking

model_name = "facebook/bart-large-cnn"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
dataset = load_from_disk("data/processed_summary")
output_dir = "models/trained_summarization_model"
train_with_tracking(model, tokenizer, dataset, output_dir)
```

## Model Fine-Tuning

Specific fine-tuning scripts for each task:

- `ml/models/fine_tune_summarization.py`: Fine-tunes models like BART, T5, Pegasus for summarization
- `ml/models/fine_tune_clause_extraction.py`: Fine-tunes for clause extraction
- `ml/models/fine_tune_risk_classification.py`: Fine-tunes for risk classification

Run these scripts directly or integrate into the training pipeline.

## Tracking and Logging

- MLflow: Logs parameters, metrics, and artifacts
- Wandb: Provides detailed experiment tracking and visualization

Ensure API keys are set for Wandb if using.

## Best Practices

- Use LoRA for memory efficiency on large models
- Monitor GPU memory and adjust batch sizes accordingly
- Save models regularly and use the model registry (`ml/models/registry.py`) for versioning
