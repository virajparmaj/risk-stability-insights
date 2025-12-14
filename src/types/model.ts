// src/types/model.ts
export interface ModelCard {
  model_name: string;
  version: string;
  target: string;
  description: string;
  required_features: string[];
}

export interface ScoreResult {
  low_risk_probability: number;
  risk_tier: "Low" | "Standard";
}