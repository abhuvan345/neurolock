# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from prototype_pipeline import (
    evaluate_sample,
    train_user_model,
    generate_synthetic_user_data,
    FEATURE_ORDER,
)
from prototype_pipeline import MODEL_DIR, DATA_DIR
import pandas as pd
import json
import time
import glob
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/")
def home():
    return jsonify({"message": "NeuroLock ML Service Active"}), 200

@app.route("/train", methods=["POST"])
def train_user():
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    df = generate_synthetic_user_data()
    train_user_model(user_id, df)
    return jsonify({"message": f"Model for {user_id} trained successfully"}), 200

@app.route("/status/<user_id>", methods=["GET"])
def status(user_id: str):
    """Return learning/training status and sample counts for a user."""
    meta_path = os.path.join(DATA_DIR, f"{user_id}_meta.json")
    samples_path = os.path.join(DATA_DIR, f"{user_id}_samples.csv")
    model_path = os.path.join(MODEL_DIR, f"{user_id}_model.pkl")

    meta = {
        "trained": False,
        "start_time": None,
        "training_window_sec": None,
        "min_train_samples": None,
    }
    if os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta.update(json.load(f))
        except Exception:
            pass

    sample_count = 0
    if os.path.exists(samples_path):
        try:
            df = pd.read_csv(samples_path)
            sample_count = len(df)
        except Exception:
            pass

    elapsed_sec = None
    if meta.get("start_time"):
        try:
            elapsed_sec = int(time.time()) - int(meta["start_time"])
        except Exception:
            pass

    return jsonify({
        "user_id": user_id,
        "trained": bool(meta.get("trained", False)),
        "model_exists": os.path.exists(model_path),
        "sample_count": sample_count,
        "training_window_sec": meta.get("training_window_sec"),
        "min_train_samples": meta.get("min_train_samples"),
        "elapsed_sec": elapsed_sec,
    }), 200

@app.route("/reset", methods=["POST"])
def reset_user():
    """Reset a user's learning artifacts (meta, samples, model)."""
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    removed = []
    for path in [
        os.path.join(DATA_DIR, f"{user_id}_meta.json"),
        os.path.join(DATA_DIR, f"{user_id}_samples.csv"),
        os.path.join(MODEL_DIR, f"{user_id}_model.pkl"),
    ]:
        if os.path.exists(path):
            try:
                os.remove(path)
                removed.append(os.path.basename(path))
            except Exception as e:
                return jsonify({"error": f"Failed to remove {path}: {e}"}), 500

    return jsonify({"message": "User reset complete", "removed": removed}), 200

@app.route("/force-train", methods=["POST"])
def force_train():
    """Force training now using collected samples. Accepts optional 'force' to bypass min sample checks."""
    data = request.json
    user_id = data.get("user_id")
    force = bool(data.get("force", False))
    min_samples_override = data.get("min_samples_override")
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    samples_path = os.path.join(DATA_DIR, f"{user_id}_samples.csv")
    if not os.path.exists(samples_path):
        return jsonify({"error": "No samples to train on"}), 400

    try:
        df = pd.read_csv(samples_path)
        df = df[[c for c in FEATURE_ORDER if c in df.columns]].dropna()
        n = len(df)
        # Default thresholds
        min_required = int(min_samples_override) if min_samples_override is not None else 20
        if not force and n < min_required:
            return jsonify({"error": f"Not enough samples ({n}) to train", "min_required": min_required}), 400

        df = df[FEATURE_ORDER]
        train_user_model(user_id, df)

        # update meta
        meta_path = os.path.join(DATA_DIR, f"{user_id}_meta.json")
        meta = {"trained": True, "start_time": int(time.time())}
        try:
            if os.path.exists(meta_path):
                with open(meta_path, "r", encoding="utf-8") as f:
                    old = json.load(f)
                meta = {**old, **meta}
        except Exception:
            pass
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(meta, f)

        return jsonify({"message": "Training complete", "samples_used": n}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        user_id = data.get("user_id")
        sample = data.get("sample")
        if not user_id or not sample:
            return jsonify({"error": "Missing user_id or sample"}), 400

        trust_score, action = evaluate_sample(user_id, sample)
        return jsonify({"trust_score": trust_score, "action": action}), 200
    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
