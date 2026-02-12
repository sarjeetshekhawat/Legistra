import pandas as pd
try:
    from evidently import Report
    from evidently.metrics import DriftedColumnsCount, ValueDrift
    EVIDENTLY_AVAILABLE = True
except ImportError:
    EVIDENTLY_AVAILABLE = False
    Report = None
import os
import subprocess

def detect_drift(reference_data, current_data, column_mapping=None):
    if not EVIDENTLY_AVAILABLE:
        # Fallback if evidently is not available
        return None
    try:
        # Use new evidently API
        report = Report(metrics=[DriftedColumnsCount(), ValueDrift()])
        report.run(reference_data=reference_data, current_data=current_data)
        return report
    except Exception as e:
        print(f"Error running drift detection: {e}")
        return None

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
    if report:
        try:
            report_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../reports/drift_report.html")
            os.makedirs(os.path.dirname(report_path), exist_ok=True)
            report.save_html(report_path)
            # Check drift metric - API may have changed
            report_dict = report.as_dict() if hasattr(report, 'as_dict') else {}
            drift_metric = 0.0  # Default if cannot extract
            if 'metrics' in report_dict and len(report_dict['metrics']) > 0:
                drift_metric = report_dict['metrics'][0].get('result', {}).get('drift_score', 0.0)
            retrain_trigger(drift_metric)
        except Exception as e:
            print(f"Error saving report: {e}")
