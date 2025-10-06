import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datasets import load_from_disk

def compare_embeddings(models, dataset_path, sample_size=100):
    dataset = load_from_disk(dataset_path)
    texts = [item['text'] for item in dataset['test'][:sample_size]]

    results = {}
    for model_name in models:
        model = SentenceTransformer(model_name)
        embeddings = model.encode(texts)
        # Compute average similarity or other metrics
        similarities = cosine_similarity(embeddings)
        avg_similarity = np.mean(similarities)
        results[model_name] = avg_similarity
        print(f"{model_name}: Avg Similarity {avg_similarity}")

    return results

if __name__ == "__main__":
    models = ["nlpaueb/legal-bert-base-uncased", "sentence-transformers/all-MiniLM-L6-v2"]
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/processed_cuad")
    compare_embeddings(models, dataset_path)
