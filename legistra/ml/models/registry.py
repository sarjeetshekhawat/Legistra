import mlflow
import mlflow.pytorch
import os

class ModelRegistry:
    def __init__(self, tracking_uri="sqlite:///mlflow.db"):
        mlflow.set_tracking_uri(tracking_uri)

    def register_model(self, model, model_name, run_name="training_run"):
        with mlflow.start_run(run_name=run_name):
            mlflow.pytorch.log_model(model, model_name)
            run_id = mlflow.active_run().info.run_id
            model_uri = f"runs:/{run_id}/{model_name}"
            mlflow.register_model(model_uri, model_name)
        return run_id

    def load_model(self, model_name, version="latest"):
        model_uri = f"models:/{model_name}/{version}"
        model = mlflow.pytorch.load_model(model_uri)
        return model

    def list_models(self):
        client = mlflow.tracking.MlflowClient()
        return client.list_registered_models()

if __name__ == "__main__":
    registry = ModelRegistry()
    # Example: register a model
    # from transformers import AutoModel
    # model = AutoModel.from_pretrained("path/to/model")
    # registry.register_model(model, "legal_summarizer")
    models = registry.list_models()
    print(models)
