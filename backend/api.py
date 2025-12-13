# api.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
from pathlib import Path
from typing import Optional, Dict, Any

# ======================================================
# Configuration
# ======================================================

MODEL_PATH = Path("artifacts/low_risk_model_B3_chronic_xgb.joblib")

APP_NAME = "Risk Stability Insights API"
MODEL_NAME = "B3_chronic_xgb"
MODEL_VERSION = "v1.0"
TARGET = "LOW_RISK_PROBABILITY"

# ======================================================
# Load model at startup (ONCE)
# ======================================================

try:
    model = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model artifact: {e}")

# Extract required feature names from the pipeline
try:
    REQUIRED_FEATURES = model.feature_names_in_.tolist()
except AttributeError:
    # Fallback: infer from training columns if needed
    raise RuntimeError("Model does not expose feature_names_in_. Re-export pipeline with sklearn >=1.0.")

# ======================================================
# FastAPI app
# ======================================================

app = FastAPI(
    title=APP_NAME,
    version=MODEL_VERSION,
    description="API for scoring low-risk healthcare members using MEPS-derived features",
)

# --------------------------------------------------
# CORS (local dev + Vercel)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        "https://risk-stability-insights.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# Schemas
# ======================================================

class MemberRecord(BaseModel):
    """
    Generic member payload.
    Keys must match REQUIRED_FEATURES.
    Extra fields are ignored.
    """
    data: Dict[str, Optional[float | int | str]]


class ScoreResponse(BaseModel):
    low_risk_probability: float
    risk_tier: str


# ======================================================
# Helper functions
# ======================================================

def build_dataframe(payload: Dict[str, Any]) -> pd.DataFrame:
    """
    Build a single-row DataFrame with required columns.
    Missing columns raise a validation error.
    """
    missing = set(REQUIRED_FEATURES) - set(payload.keys())
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required features: {sorted(missing)}"
        )

    df = pd.DataFrame([{k: payload.get(k) for k in REQUIRED_FEATURES}])
    return df


# ======================================================
# Routes
# ======================================================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "version": MODEL_VERSION,
    }


@app.get("/model-card")
def model_card():
    """
    Returns model metadata for UI documentation.
    """
    return {
        "model_name": MODEL_NAME,
        "version": MODEL_VERSION,
        "target": TARGET,
        "description": (
            "Gradient-boosted tree model trained on MEPS 2023 data "
            "using the minimum stable predictive structure (B3_chronic). "
            "Predicts probability of stable low-risk membership without "
            "using cost or utilization variables."
        ),
        "required_features": REQUIRED_FEATURES,
        "deployment_notes": [
            "Uses upstream health indicators only",
            "Avoids cost and utilization leakage",
            "Optimized for stability under uncertainty",
        ],
    }


@app.post("/score", response_model=ScoreResponse)
def score_member(payload: MemberRecord):
    """
    Score a single member.
    """
    X = build_dataframe(payload.data)

    proba = model.predict_proba(X)[0, 1]

    return {
        "low_risk_probability": float(proba),
        "risk_tier": "Low" if proba >= 0.7 else "Standard",
    }


@app.post("/score-batch")
def score_batch(records: list[Dict[str, Any]]):
    """
    Score multiple members at once.
    """
    if len(records) == 0:
        raise HTTPException(status_code=400, detail="Empty payload")

    df = pd.DataFrame(records)

    missing = set(REQUIRED_FEATURES) - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required features: {sorted(missing)}"
        )

    X = df[REQUIRED_FEATURES]
    probs = model.predict_proba(X)[:, 1]

    return {
        "n_scored": len(probs),
        "results": [
            {
                "low_risk_probability": float(p),
                "risk_tier": "Low" if p >= 0.7 else "Standard",
            }
            for p in probs
        ],
    }