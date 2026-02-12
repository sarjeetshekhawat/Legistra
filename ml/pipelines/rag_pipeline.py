import os
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import faiss
import numpy as np

class RAGPipeline:
    def __init__(self, retriever_model_path, generator_model_path, index_path=None):
        self.retriever = SentenceTransformer(retriever_model_path)
        self.generator = pipeline("text2text-generation", model=generator_model_path)
        self.index = None
        if index_path and os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
        self.documents = []

    def build_index(self, documents, index_path):
        self.documents = documents
        embeddings = self.retriever.encode(documents)
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)  # Inner product for cosine
        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        faiss.write_index(self.index, index_path)

    def retrieve(self, query, top_k=5):
        query_embedding = self.retriever.encode([query])
        faiss.normalize_L2(query_embedding)
        distances, indices = self.index.search(query_embedding, top_k)
        retrieved_docs = [self.documents[i] for i in indices[0]]
        return retrieved_docs

    def generate(self, query, retrieved_docs):
        context = " ".join(retrieved_docs)
        input_text = f"Context: {context}\nQuestion: {query}\nAnswer:"
        result = self.generator(input_text, max_length=200, num_return_sequences=1)
        return result[0]['generated_text']

    def analyze(self, document_text):
        # For analysis, use document as query or split
        if self.index is None:
            # No index, use direct generation
            summary = self.generator(f"Summarize the legal document: {document_text[:1000]}", max_length=200, num_return_sequences=1)[0]['generated_text']
            clauses = self.generator(f"Extract key clauses: {document_text[:1000]}", max_length=200, num_return_sequences=1)[0]['generated_text']
            risks = self.generator(f"Identify risks: {document_text[:1000]}", max_length=200, num_return_sequences=1)[0]['generated_text']
        else:
            query = document_text[:500]  # Summary query
            retrieved = self.retrieve(query)
            summary = self.generate("Summarize the legal document", retrieved)
            clauses = self.generate("Extract key clauses", retrieved)
            risks = self.generate("Identify risks", retrieved)
        return {'summary': summary, 'clauses': clauses, 'risks': risks}

if __name__ == "__main__":
    retriever_model = "nlpaueb/legal-bert-base-uncased"
    generator_model = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../models/summarization_model")
    index_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/faiss_index.idx")
    rag = RAGPipeline(retriever_model, generator_model, index_path)
    # Assume documents are loaded
    documents = ["Sample legal text 1", "Sample legal text 2"]
    rag.build_index(documents, index_path)
    result = rag.analyze("Full document text")
    print(result)
