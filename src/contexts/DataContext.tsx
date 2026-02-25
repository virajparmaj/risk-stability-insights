// src/contexts/DataContext.tsx

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import Papa from "papaparse";
import { fetchModelCard, scoreBatch } from "@/services/api";
import { alignFeatures } from "@/lib/alignFeatures";
import { demoRunSnapshot } from "@/data/demoRunSnapshot";
import {
  DataQualitySummary,
  RunAnalytics,
  computeRunAnalytics,
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
  isDemoRefreshing: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const STORAGE_KEY = "risk-stability-current-run-v2";
const DEMO_CSV_URL = "/data/meps_model_ready_2023.csv";
const DEMO_RUN_ID = "demo-meps-2023";
const LOW_RISK_THRESHOLD = 0.7;
const ENABLE_DEMO_SNAPSHOT_BOOTSTRAP =
  (import.meta.env.VITE_DEMO_SNAPSHOT_BOOTSTRAP ?? "true") === "true";
const DEMO_REFRESH_MARKER_KEY = "risk-stability-demo-refresh-v1";

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function getRowCost(row: Record<string, string>): number {
  const directCost = asNumber(row.TOTEXP23) ?? asNumber(row.TOTEXP);
  if (directCost !== null) return Math.max(0, directCost);

  const logCost = asNumber(row.LOG_TOTEXP23) ?? asNumber(row.LOG_TOTEXP);
  if (logCost !== null) {
    return Math.max(0, Math.exp(Math.min(logCost, 16)));
  }

  return 0;
}

function buildFallbackScoredRows(rows: Record<string, string>[]): ScoredRow[] {
  return rows.map((row) => {
    const age = asNumber(row.AGELAST) ?? asNumber(row.AGE) ?? 45;
    const chronic = asNumber(row.CHRONIC_CT) ?? 0;
    const k6 = asNumber(row.K6SUM42) ?? 0;
    const rx = asNumber(row.RXTOT23) ?? 0;
    const cost = getRowCost(row);

    const rawScore =
      1.35 -
      0.00009 * cost -
      0.32 * chronic -
      0.03 * Math.max(k6, 0) -
      0.0008 * Math.max(rx, 0) +
      0.005 * Math.max(50 - age, 0);
    const probability = Math.min(0.999, Math.max(0.001, sigmoid(rawScore)));

    return {
      low_risk_probability: probability,
      risk_tier: probability >= LOW_RISK_THRESHOLD ? "Low" : "Standard",
    };
  });
}

function buildRunSummary(probabilities: number[]): RunSummary {
  return {
    n_members: probabilities.length,
    mean_probability:
      probabilities.reduce((acc, value) => acc + value, 0) /
      Math.max(probabilities.length, 1),
    low_risk_rate:
      probabilities.filter((value) => value >= LOW_RISK_THRESHOLD).length /
      Math.max(probabilities.length, 1),
  };
}

async function loadDemoCsvRows(): Promise<Record<string, string>[]> {
  const response = await fetch(DEMO_CSV_URL, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error("Unable to load demo MEPS dataset");
  }

  const csvText = await response.text();
  return new Promise<Record<string, string>[]>((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = (results.data ?? []).filter((row) =>
          Object.values(row).some((value) => value !== "")
        );
        resolve(rows);
      },
      error: (error) => reject(error),
    });
  });
}

function buildFallbackDemoRun(rawRows: Record<string, string>[]): RunState {
  const preferredFeatures = [
    "AGELAST",
    "AGE",
    "SEX",
    "RACETHX",
    "HISPANX",
    "POVCAT23",
    "INSURC23",
    "CHRONIC_CT",
    "K6SUM42",
    "PHQ242",
    "OBTOTV23",
    "OPTOTV23",
    "RXTOT23",
    "TOTEXP23",
    "LOG_TOTEXP23",
  ];
  const rowKeys = Object.keys(rawRows[0] ?? {});
  const fallbackFeatures = preferredFeatures.filter((feature) =>
    rowKeys.includes(feature)
  );
  const requiredFeatures = fallbackFeatures.length
    ? fallbackFeatures
    : rowKeys.slice(0, Math.min(46, rowKeys.length));

  const aligned = alignFeatures(rawRows, requiredFeatures);
  const scoredRows = buildFallbackScoredRows(rawRows);
  const probabilities = scoredRows.map((entry) => entry.low_risk_probability);

  const dataQuality: DataQualitySummary = {
    rowCount: rawRows.length,
    requiredFeatureCount: requiredFeatures.length,
    missingRequiredColumns: aligned.missingRequiredFeatures,
    replacedValueCount: aligned.totalReplacedWithZero,
    replacementStats: aligned.replacementStats,
  };

  const analytics = computeRunAnalytics({
    rawRows,
    alignedRows: aligned.rows,
    probabilities,
    threshold: LOW_RISK_THRESHOLD,
  });

  return {
    id: DEMO_RUN_ID,
    datasetName: "meps_model_ready_2023",
    sourceFilename: "meps_model_ready_2023.csv",
    timestamp: new Date().toISOString(),
    modelCard: {
      model_name: "demo_fallback_model",
      version: "v1.0-fallback",
      target: "LOW_RISK_PROBABILITY",
      required_features: requiredFeatures,
      deployment_notes: ["Fallback scoring used when backend is unavailable"],
    },
    scoredRows,
    alignedRows: aligned.rows,
    results: scoredRows,
    summary: buildRunSummary(probabilities),
    dataQuality,
    analytics,
    sourceRows: rawRows,
  };
}

async function buildDemoRun(): Promise<RunState | null> {
  const rawRows = await loadDemoCsvRows();
  if (!rawRows.length) return null;

  try {
    const modelCard = await fetchModelCard();
    const aligned = alignFeatures(rawRows, modelCard.required_features);

    if (aligned.missingRequiredFeatures.length > 0) return null;

    const scored = await scoreBatch(aligned.rows);
    const probabilities = scored.results.map(
      (entry) => entry.low_risk_probability
    );

    const dataQuality: DataQualitySummary = {
      rowCount: rawRows.length,
      requiredFeatureCount: modelCard.required_features.length,
      missingRequiredColumns: aligned.missingRequiredFeatures,
      replacedValueCount: aligned.totalReplacedWithZero,
      replacementStats: aligned.replacementStats,
    };

    const analytics = computeRunAnalytics({
      rawRows,
      alignedRows: aligned.rows,
      probabilities,
      threshold: LOW_RISK_THRESHOLD,
    });

    return {
      id: DEMO_RUN_ID,
      datasetName: "meps_model_ready_2023",
      sourceFilename: "meps_model_ready_2023.csv",
      timestamp: new Date().toISOString(),
      modelCard,
      scoredRows: scored.results,
      alignedRows: aligned.rows,
      results: scored.results,
      summary: buildRunSummary(probabilities),
      dataQuality,
      analytics,
      sourceRows: rawRows,
    };
  } catch {
    return buildFallbackDemoRun(rawRows);
  }
}

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

function getSnapshotRunState(): RunState | null {
  if (!ENABLE_DEMO_SNAPSHOT_BOOTSTRAP) return null;
  try {
    return JSON.parse(JSON.stringify(demoRunSnapshot)) as RunState;
  } catch {
    return null;
  }
}

function persistRun(run: RunState | null) {
  if (typeof window === "undefined") return;

  if (!run) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  const { sourceRows, alignedRows, ...persistableRun } = run;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableRun));
}

/* ============================
   Provider
============================ */

export function DataProvider({ children }: { children: ReactNode }) {
  const [currentRunState, setCurrentRunState] = useState<RunState | null>(() => {
    return getInitialRunState() ?? getSnapshotRunState();
  });
  const [isDemoRefreshing, setIsDemoRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasAttemptedRefresh =
      window.localStorage.getItem(DEMO_REFRESH_MARKER_KEY) === "true";
    if (hasAttemptedRefresh) return;

    const shouldRefreshDemo =
      !currentRunState || currentRunState.id.startsWith("demo");
    if (!shouldRefreshDemo) return;

    let isCancelled = false;
    setIsDemoRefreshing(true);
    window.localStorage.setItem(DEMO_REFRESH_MARKER_KEY, "true");

    // Auto-seed a demo run so first-time visitors do not land on blank dashboards.
    void buildDemoRun().then((demoRun) => {
      if (!demoRun || isCancelled) return;

      setCurrentRunState(demoRun);
      persistRun(demoRun);
    }).finally(() => {
      if (!isCancelled) setIsDemoRefreshing(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [currentRunState]);

  const setCurrentRun = (run: RunState | null) => {
    setCurrentRunState(run);
    persistRun(run);
  };

  return (
    <DataContext.Provider
      value={{ currentRun: currentRunState, setCurrentRun, isDemoRefreshing }}
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
