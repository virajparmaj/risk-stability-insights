// src/contexts/DataContext.tsx

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* ============================
   Types
============================ */

export interface ModelCard {
  model_name: string;
  version: string;
  target: string;
  required_features: string[];
  deployment_notes?: string[];
}

export type RiskTier = "Low" | "Standard";

export interface ScoredRow {
  low_risk_probability: number;
  risk_tier: RiskTier;
}

export interface RunSummary {
  n_members: number;
  mean_probability: number;
  low_risk_rate: number;
}

export interface RunState {
  id: string;
  datasetName: string;
  timestamp: string;
  modelCard: ModelCard;
  results: ScoredRow[];
  summary: RunSummary;
}

/* ============================
   Context
============================ */

interface DataContextType {
  currentRun: RunState | null;
  setCurrentRun: (run: RunState | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/* ============================
   Provider
============================ */

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentRun, setCurrentRun] = useState<RunState | null>(null);

  return (
    <DataContext.Provider value={{ currentRun, setCurrentRun }}>
      {children}
    </DataContext.Provider>
  );
}

/* ============================
   Hook
============================ */

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within DataProvider");
  }
  return ctx;
}