import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

import { alignFeatures } from "../src/lib/alignFeatures";
import { computeRunAnalytics, type DataQualitySummary } from "../src/lib/runAnalytics";
import type { RunState, ScoredRow, ModelCard } from "../src/contexts/DataContext";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const API_BASE_URL =
  process.env.DEMO_API_URL ?? "https://risk-stability-insights.onrender.com";
const CSV_PATH =
  process.env.DEMO_CSV_PATH ??
  path.resolve(ROOT, "public/data/meps_model_ready_2023.csv");
const OUTPUT_PATH = path.resolve(ROOT, "src/data/demoRunSnapshot.ts");

const LOW_RISK_THRESHOLD = 0.7;
const FETCH_TIMEOUT_MS = 12_000;

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function getRowCost(row: Record<string, string>): number {
  const directCost = toFiniteNumber(row.TOTEXP23) ?? toFiniteNumber(row.TOTEXP);
  if (directCost !== null) return Math.max(0, directCost);

  const logCost =
    toFiniteNumber(row.LOG_TOTEXP23) ?? toFiniteNumber(row.LOG_TOTEXP);
  if (logCost !== null) {
    return Math.max(0, Math.exp(Math.min(logCost, 16)));
  }

  return 0;
}

function buildFallbackScoredRows(rows: Record<string, string>[]): ScoredRow[] {
  return rows.map((row) => {
    const age = toFiniteNumber(row.AGELAST) ?? toFiniteNumber(row.AGE) ?? 45;
    const chronic = toFiniteNumber(row.CHRONIC_CT) ?? 0;
    const k6 = toFiniteNumber(row.K6SUM42) ?? 0;
    const rx = toFiniteNumber(row.RXTOT23) ?? 0;
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
      low_risk_probability: Number(probability.toFixed(6)),
      risk_tier: probability >= LOW_RISK_THRESHOLD ? "Low" : "Standard",
    };
  });
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadCsvRows(filePath: string): Promise<Record<string, string>[]> {
  const csvText = await fs.readFile(filePath, "utf8");

  return new Promise((resolve, reject) => {
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

function buildSummary(probabilities: number[]) {
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

async function buildSnapshot(): Promise<RunState> {
  const rawRows = await loadCsvRows(CSV_PATH);
  if (!rawRows.length) {
    throw new Error("No rows found in demo CSV");
  }

  let modelCard: ModelCard | null = null;
  let scoredRows: ScoredRow[] | null = null;

  try {
    modelCard = await fetchJson<ModelCard>(`${API_BASE_URL}/model-card`);
    const alignedForApi = alignFeatures(rawRows, modelCard.required_features);

    if (alignedForApi.missingRequiredFeatures.length > 0) {
      throw new Error("Model card features missing in demo dataset");
    }

    const scoreResponse = await fetchJson<{ results: ScoredRow[] }>(
      `${API_BASE_URL}/score-batch`,
      {
        method: "POST",
        body: JSON.stringify(alignedForApi.rows),
      }
    );

    scoredRows = scoreResponse.results;
  } catch {
    modelCard = {
      model_name: "demo_fallback_model",
      version: "v1.0-fallback",
      target: "LOW_RISK_PROBABILITY",
      required_features: [
        "AGELAST",
        "SEX",
        "RACETHX",
        "HISPANX",
        "POVCAT23",
        "INSURC23",
        "TOTEXP23",
        "K6SUM42",
        "RXTOT23",
      ].filter((feature) => feature in (rawRows[0] ?? {})),
      deployment_notes: ["Fallback scoring used when API was unavailable"],
    };

    scoredRows = buildFallbackScoredRows(rawRows);
  }

  const aligned = alignFeatures(rawRows, modelCard.required_features);
  const probabilities = scoredRows.map((row) => row.low_risk_probability);

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

  const snapshot: RunState = {
    id: "demo-snapshot-meps-2023",
    datasetName: "meps_model_ready_2023",
    sourceFilename: path.basename(CSV_PATH),
    timestamp: new Date().toISOString(),
    modelCard,
    scoredRows,
    results: scoredRows,
    summary: buildSummary(probabilities),
    dataQuality,
    analytics,
  };

  return snapshot;
}

async function main() {
  const snapshot = await buildSnapshot();

  const fileContents = `/* eslint-disable */\n/* Auto-generated by scripts/build-demo-snapshot.ts */\n\nimport type { RunState } from "@/contexts/DataContext";\n\nexport const demoRunSnapshot: RunState = ${JSON.stringify(snapshot, null, 2)};\n`;

  await fs.writeFile(OUTPUT_PATH, fileContents, "utf8");
  console.log(`Demo snapshot written to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
