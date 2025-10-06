import os
from datasets import load_from_disk
import nltk
nltk.download('punkt')

def preprocess_cuad(data_dir):
    dataset = load_from_disk(os.path.join(data_dir, "cuad"))
    # Assuming CUAD has 'text' and 'contracts' with clauses
    processed = []
    for item in dataset['train']:
        text = item['text']
        clauses = item.get('contracts', [])  # Adjust based on actual structure
        # For clause extraction, extract clauses
        processed.append({'text': text, 'clauses': clauses})
    return processed

def preprocess_ledgar(data_dir):
    dataset = load_from_disk(os.path.join(data_dir, "ledgar"))
    # Assuming LEDGAR has 'text' and 'label' for classification
    processed = []
    for item in dataset['train']:
        text = item['text']
        label = item['label']  # Risk level or category
        processed.append({'text': text, 'label': label})
    return processed

def preprocess_for_summarization(data_dir):
    # Use a subset for summarization, perhaps from CUAD or LEDGAR
    dataset = load_from_disk(os.path.join(data_dir, "cuad"))
    processed = []
    for item in dataset['train'][:1000]:  # Sample
        text = item['text']
        summary = text[:200] + "..."  # Placeholder, in real use generate or have ground truth
        processed.append({'text': text, 'summary': summary})
    return processed

if __name__ == "__main__":
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")
    cuad_data = preprocess_cuad(data_dir)
    ledgar_data = preprocess_ledgar(data_dir)
    summary_data = preprocess_for_summarization(data_dir)
    # Save processed data, e.g., as json or dataset
    import json
    with open(os.path.join(data_dir, "processed_cuad.json"), 'w') as f:
        json.dump(cuad_data, f)
    with open(os.path.join(data_dir, "processed_ledgar.json"), 'w') as f:
        json.dump(ledgar_data, f)
    with open(os.path.join(data_dir, "processed_summary.json"), 'w') as f:
        json.dump(summary_data, f)
