import pandas as pd
from evidently import ColumnMapping
from evidently.report import Report
from evidently.metrics import DataDriftTable
from evidently.metrics import DatasetDriftMetric
import os
import subprocess

def detect_drift(reference_data, current_data, column_mapping=None):
    report = Report(metrics=[DataDriftTable(), DatasetDriftMetric()])
    report.run(reference_data=reference_data, current_data=current_data, column_mapping=column_mapping)
    return report

def retrain_trigger(drift_score, threshold=0.1):
    if drift_score > threshold:
        print("Drift detected, triggering retraining...")
        # Call retraining script
        script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../scripts/train_pipeline.py")
        subprocess.call(["python", script_path])
        return True
    return False

if __name__ == "__main__":
    # Example: Load reference and current data
    reference = pd.DataFrame({"feature1": [1, 2, 3], "feature2": [4, 5, 6]})
    current = pd.DataFrame({"feature1": [1.1, 2.1, 3.1], "feature2": [4.1, 5.1, 6.1]})
    report = detect_drift(reference, current)
    report.save_html(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../reports/drift_report.html"))
    # Check drift metric
    drift_metric = report.as_dict()['metrics'][1]['result']['drift_score']
    retrain_trigger(drift_metric)
