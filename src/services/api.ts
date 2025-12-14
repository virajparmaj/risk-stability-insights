// src/services/api.ts

// ======================================================
// Base URL
// ======================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  "https://risk-stability-insights.onrender.com";

// ======================================================
// Shared Types
// ======================================================

export type RiskTier = "Low" | "Standard";

// ======================================================
// Model Card
// ======================================================

export interface ModelCard {
  model_name: string;
  version: string;
  target: string;
  required_features: string[];
  deployment_notes: string[];
}

// ======================================================
// Single-member scoring
// ======================================================

export interface ScorePayload {
  data: Record<string, number | string | null>;
}

export interface ScoreResponse {
  low_risk_probability: number;
  risk_tier: RiskTier;
}

// ======================================================
// Batch scoring
// ======================================================

export interface BatchScoreResult {
  low_risk_probability: number;
  risk_tier: RiskTier;
}

export interface BatchScoreResponse {
  n_scored: number;
  results: BatchScoreResult[];
}

// ======================================================
// Internal helper
// ======================================================

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "API request failed");
  }
  return res.json() as Promise<T>;
}

// ======================================================
// API Calls
// ======================================================

export async function healthCheck(): Promise<{
  status: string;
  model: string;
  version: string;
}> {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(res);
}

export async function fetchModelCard(): Promise<ModelCard> {
  const res = await fetch(`${API_BASE_URL}/model-card`);
  return handleResponse<ModelCard>(res);
}

export async function scoreMember(
  payload: ScorePayload
): Promise<ScoreResponse> {
  const res = await fetch(`${API_BASE_URL}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ScoreResponse>(res);
}

export async function scoreBatch(
  records: Record<string, number | string | null>[]
): Promise<BatchScoreResponse> {
  const res = await fetch(`${API_BASE_URL}/score-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(records),
  });

  return handleResponse<BatchScoreResponse>(res);
}