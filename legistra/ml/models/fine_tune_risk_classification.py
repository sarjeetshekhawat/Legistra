import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_from_disk

def fine_tune_risk_classification(model_name, dataset_path, output_dir, epochs=3, batch_size=8, num_labels=3):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)

    dataset = load_from_disk(dataset_path)

    def preprocess_function(examples):
        inputs = examples['text']
        model_inputs = tokenizer(inputs, max_length=512, truncation=True)
        model_inputs['labels'] = examples['label']
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
        metric_for_best_model="eval_accuracy",
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
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/processed_ledgar")
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../models/risk_classification_model")
    fine_tune_risk_classification(model_name, dataset_path, output_dir)
