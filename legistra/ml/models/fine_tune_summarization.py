import os
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, Trainer, TrainingArguments
from datasets import load_dataset, load_from_disk

def fine_tune_summarization(model_name, dataset_path, output_dir, epochs=3, batch_size=8):
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    dataset = load_from_disk(dataset_path)

    def preprocess_function(examples):
        inputs = examples['text']
        model_inputs = tokenizer(inputs, max_length=1024, truncation=True)
        with tokenizer.as_target_tokenizer():
            labels = tokenizer(examples['summary'], max_length=128, truncation=True)
        model_inputs['labels'] = labels['input_ids']
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
        metric_for_best_model="eval_loss",
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
    model_name = "facebook/bart-large-cnn"
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/processed_summary")
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../models/summarization_model")
    fine_tune_summarization(model_name, dataset_path, output_dir)
