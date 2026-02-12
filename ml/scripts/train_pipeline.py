import os
import mlflow
import wandb
from transformers import Trainer, TrainingArguments
from peft import LoraConfig, get_peft_model
import torch

def train_with_tracking(model, tokenizer, dataset, output_dir, use_lora=True, use_wandb=True, use_mlflow=True):
    if use_lora:
        lora_config = LoraConfig(
            r=16,
            lora_alpha=32,
            target_modules=["q", "v"],
            lora_dropout=0.1,
            bias="none",
            task_type="SEQ_2_SEQ_LM",
        )
        model = get_peft_model(model, lora_config)

    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        weight_decay=0.01,
        save_total_limit=2,
        save_steps=500,
        logging_dir=os.path.join(output_dir, "logs"),
        logging_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        fp16=True,  # Mixed precision
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset["train"],
        eval_dataset=dataset["validation"],
        tokenizer=tokenizer,
    )

    if use_wandb:
        wandb.init(project="legal-doc-analyzer")
    if use_mlflow:
        mlflow.start_run()

    trainer.train()

    if use_mlflow:
        mlflow.log_params(training_args.to_dict())
        mlflow.log_metric("final_loss", trainer.state.log_history[-1]['eval_loss'])
        mlflow.end_run()
    if use_wandb:
        wandb.finish()

    trainer.save_model(output_dir)

if __name__ == "__main__":
    # Example usage for summarization
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    from datasets import load_from_disk

    model_name = "facebook/bart-large-cnn"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    dataset = load_from_disk(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../data/processed_summary"))
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../models/trained_model")
    train_with_tracking(model, tokenizer, dataset, output_dir)
