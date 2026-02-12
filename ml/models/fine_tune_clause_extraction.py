import os
from transformers import AutoTokenizer, AutoModelForTokenClassification, Trainer, TrainingArguments
from datasets import load_from_disk

def fine_tune_clause_extraction(model_name, dataset_path, output_dir, epochs=3, batch_size=8):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForTokenClassification.from_pretrained(model_name, num_labels=2)  # Binary: clause or not

    dataset = load_from_disk(dataset_path)

    def preprocess_function(examples):
        inputs = examples['text']
        model_inputs = tokenizer(inputs, max_length=512, truncation=True, is_split_into_words=False)
        # Assuming labels are word-level for clauses
        labels = examples['labels']  # List of 0/1 for each token
        model_inputs['labels'] = labels
        return model_inputs

    tokenized_dataset = dataset.map(preprocess_function, batched=True)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        num_train_epochs=epochs,
        weight_decay=0.01,
        save_total_limit=2,
        save_steps=500,
        logging_dir=os.path.join(output_dir, "logs"),
        logging_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="eval_f1",
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
        tokenizer=tokenizer,
    )

    trainer.train()
    trainer.save_model(output_dir)

if __name__ == "__main__":
    model_name = "nlpaueb/legal-bert-base-uncased"
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/processed_cuad")
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../models/clause_extraction_model")
    fine_tune_clause_extraction(model_name, dataset_path, output_dir)
