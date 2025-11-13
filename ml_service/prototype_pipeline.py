# prototype_pipeline.py

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import MinMaxScaler
import joblib
import os
import json
import time

MODEL_DIR = "models"
DATA_DIR = "data"
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Training window configuration (default 15 minutes)
TRAINING_WINDOW_SEC = int(os.environ.get("TRAINING_WINDOW_SEC", str(15 * 60)))
MIN_TRAIN_SAMPLES = int(os.environ.get("MIN_TRAIN_SAMPLES", "100"))

# Feature order expected by the model
FEATURE_ORDER = ["avg_key_interval", "mouse_speed", "click_variance", "nav_entropy"]

# ---- Step 1: Generate synthetic training data ----
def generate_synthetic_user_data(n=200):
    np.random.seed(42)
    data = {
        "avg_key_interval": np.random.normal(0.3, 0.05, n),
        "mouse_speed": np.random.normal(120, 10, n),
        "click_variance": np.random.normal(0.2, 0.03, n),
        "nav_entropy": np.random.normal(0.8, 0.1, n)
    }
    return pd.DataFrame(data)

# ---- Step 2: Train model for a user ----
def train_user_model(user_id, df):
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(df)
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X_scaled)
    joblib.dump((model, scaler), f"{MODEL_DIR}/{user_id}_model.pkl")
    print(f"✅ Model for user {user_id} trained and saved.")
    return model, scaler

def _user_meta_path(user_id: str) -> str:
    return os.path.join(DATA_DIR, f"{user_id}_meta.json")

def _user_samples_path(user_id: str) -> str:
    return os.path.join(DATA_DIR, f"{user_id}_samples.csv")

def _load_meta(user_id: str) -> dict:
    path = _user_meta_path(user_id)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # default meta
    meta = {
        "start_time": int(time.time()),
        "trained": False,
        "training_window_sec": TRAINING_WINDOW_SEC,
        "min_train_samples": MIN_TRAIN_SAMPLES,
    }
    _save_meta(user_id, meta)
    return meta

def _save_meta(user_id: str, meta: dict) -> None:
    with open(_user_meta_path(user_id), "w", encoding="utf-8") as f:
        json.dump(meta, f)

def _append_user_sample(user_id: str, sample_dict: dict) -> int:
    # Ensure only required features and in order
    row = {k: float(sample_dict.get(k, 0.0)) for k in FEATURE_ORDER}
    df_row = pd.DataFrame([row])
    csv_path = _user_samples_path(user_id)
    header = not os.path.exists(csv_path)
    df_row.to_csv(csv_path, mode="a", header=header, index=False)
    # return count rows
    try:
        df = pd.read_csv(csv_path)
        return len(df)
    except Exception:
        return 1

def _load_user_samples(user_id: str) -> pd.DataFrame:
    csv_path = _user_samples_path(user_id)
    if not os.path.exists(csv_path):
        return pd.DataFrame(columns=FEATURE_ORDER)
    df = pd.read_csv(csv_path)
    # Keep only feature columns and drop NaNs
    df = df[[c for c in FEATURE_ORDER if c in df.columns]].copy()
    df = df.dropna()
    return df

# ---- Step 3: Evaluate new sample with 15-min learning phase ----
def evaluate_sample(user_id, sample_dict):
    model_path = f"{MODEL_DIR}/{user_id}_model.pkl"

    # Load meta (creates new if missing)
    meta = _load_meta(user_id)

    # If not trained yet, accumulate samples during the training window
    if not meta.get("trained", False):
        now = int(time.time())
        window_sec = int(meta.get("training_window_sec", TRAINING_WINDOW_SEC))
        min_samples = int(meta.get("min_train_samples", MIN_TRAIN_SAMPLES))

        # Append current sample to the user's dataset
        total_samples = _append_user_sample(user_id, sample_dict)

        # Check if training window elapsed and we have enough samples
        if (now - int(meta.get("start_time", now))) >= window_sec and total_samples >= min_samples:
            # Train personalized model on collected real user data
            df_user = _load_user_samples(user_id)
            # ensure correct feature order
            df_user = df_user[FEATURE_ORDER]
            train_user_model(user_id, df_user)
            meta["trained"] = True
            _save_meta(user_id, meta)
            # After training, fall through to evaluate with new model below
        else:
            # Still in learning phase: be permissive and allow
            print(
                f"🧠 Learning phase for {user_id}: {total_samples} samples, "
                f"elapsed {(now - int(meta.get('start_time', now))) // 60}m/"
                f"{window_sec // 60}m"
            )
            # Return a safe, permissive score during learning
            return 90, "allow"

    # If we reach here, a trained model should exist
    if not os.path.exists(model_path):
        # As a safety fallback, don't use synthetic data; continue permissive
        print(f"⚠️ No trained model for {user_id} yet; remaining in learning mode.")
        _append_user_sample(user_id, sample_dict)
        return 90, "allow"

    # Evaluate with trained model
    model, scaler = joblib.load(model_path)

    # Ensure features are in the correct order
    ordered_sample = {key: float(sample_dict.get(key, 0.0)) for key in FEATURE_ORDER}

    df_sample = pd.DataFrame([ordered_sample])
    X_scaled = scaler.transform(df_sample)
    score = model.decision_function(X_scaled)[0]
    trust_score = int((score + 1) * 50)  # normalize [-1,1] → [0,100]

    if trust_score >= 85:
        action = "allow"
    elif trust_score >= 65:
        action = "reauth"
    else:
        action = "lockout"

    return trust_score, action

if __name__ == "__main__":
    user = "john_doe"
    # Example: simulate a sample feed
    new_sample = {
        "avg_key_interval": 0.28,
        "mouse_speed": 118,
        "click_variance": 0.19,
        "nav_entropy": 0.81
    }
    print(evaluate_sample(user, new_sample))
