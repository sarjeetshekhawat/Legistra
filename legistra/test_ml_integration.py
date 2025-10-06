# Simple test for ML integration
from ml.pipelines.rag_pipeline import RAGPipeline
import os

def test_rag():
    retriever_model = "sentence-transformers/all-MiniLM-L6-v2"  # Use smaller model for test
    generator_model = "facebook/bart-large-cnn"  # Use smaller model
    index_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data/faiss_index.idx")
    rag = RAGPipeline(retriever_model, generator_model, index_path)

    # Sample documents
    documents = [
        "This is a legal contract for software development.",
        "The parties agree to the terms of service.",
        "Confidentiality clause: Information shall not be disclosed."
    ]
    rag.build_index(documents, index_path)

    result = rag.analyze("Summarize the contract")
    print("Analysis result:", result)
    return result

if __name__ == "__main__":
    test_rag()
