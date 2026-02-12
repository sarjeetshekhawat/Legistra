# Evaluation Guide for Legistra ML Pipeline

This guide covers the evaluation procedures for the machine learning models used in the Legal Document Analyzer, including summarization, clause extraction, and risk classification.

## Evaluation Metrics

- **Summarization**: ROUGE (ROUGE-1, ROUGE-2, ROUGE-L), BLEU scores
- **Clause Extraction**: Precision, Recall, F1-score on extracted clauses
- **Risk Classification**: Accuracy, Precision, Recall, F1-score, ROC-AUC

## Evaluation Scripts

Evaluation is integrated into the training pipeline (`ml/scripts/train_pipeline.py`) and can be run separately using fine-tuning scripts in `ml/models/`.

## Using MLflow for Evaluation Tracking

- Metrics are logged automatically during training runs.
- Use MLflow UI to compare different runs and models.
- Metrics can be exported for reporting.

## Manual Evaluation

- Use test datasets to generate predictions.
- Compare predictions against ground truth annotations.
- Generate detailed classification reports using scikit-learn.

## Example: Evaluating Risk Classification Model

```python
from sklearn.metrics import classification_report
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

# Load model and tokenizer
model = AutoModelForSequenceClassification.from_pretrained("path/to/risk_classification_model")
tokenizer = AutoTokenizer.from_pretrained("path/to/risk_classification_model")

# Prepare test data
texts = ["Sample legal clause text 1", "Sample legal clause text 2"]
inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")

# Get predictions
outputs = model(**inputs)
predictions = torch.argmax(outputs.logits, dim=-1)

# Compare with true labels
true_labels = [0, 1]
print(classification_report(true_labels, predictions))
```

## Best Practices

- Always evaluate on a held-out test set.
- Use multiple metrics to get a comprehensive view.
- Track evaluation results in MLflow for reproducibility.
- Perform error analysis to identify model weaknesses.
