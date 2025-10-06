import os
from datasets import load_dataset

def download_cuad(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    dataset = load_dataset("cuad")
    dataset.save_to_disk(os.path.join(output_dir, "cuad"))

def download_ledgar(output_dir):
    os.makedirs(output_dir, exist_ok=True)
    dataset = load_dataset("lex_glue", "ledgar")
    dataset.save_to_disk(os.path.join(output_dir, "ledgar"))

if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data")
    download_cuad(output_dir)
    download_ledgar(output_dir)
