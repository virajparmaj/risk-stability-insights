// src/contexts/DataContext.tsx

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import {
  DataQualitySummary,
  RunAnalytics,
} from "@/lib/runAnalytics";

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
  sourceFilename?: string;
  timestamp: string;
  modelCard: ModelCard;
  scoredRows: ScoredRow[];
  alignedRows?: Record<string, number>[];
  results: ScoredRow[];
  summary: RunSummary;
  dataQuality: DataQualitySummary;
  analytics: RunAnalytics;
  sourceRows?: Record<string, string | number | null>[];
}

/* ============================
   Context
============================ */

interface DataContextType {
  currentRun: RunState | null;
  setCurrentRun: (run: RunState | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const STORAGE_KEY = "risk-stability-current-run-v2";

function getInitialRunState(): RunState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RunState>;
    if (!parsed || !parsed.analytics || !parsed.dataQuality) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed as RunState;
  } catch {
    return null;
  }
}

/* ============================
   Provider
============================ */

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentRunState, setCurrentRunState] = useState<RunState | null>(
    getInitialRunState
  );

  const setCurrentRun = (run: RunState | null) => {
    setCurrentRunState(run);

    if (typeof window === "undefined") return;

    if (!run) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const { sourceRows, alignedRows, ...persistableRun } = run;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(persistableRun)
    );
  };

  return (
    <DataContext.Provider
      value={{ currentRun: currentRunState, setCurrentRun }}
    >
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
