// src/lib/runAnalytics.ts

export interface ReplacementStat {
  feature: string;
  replacedWithZero: number;
}

export interface DataQualitySummary {
  rowCount: number;
  requiredFeatureCount: number;
  missingRequiredColumns: string[];
  replacedValueCount: number;
  replacementStats: ReplacementStat[];
}

export interface CostDistributionBin {
  range: string;
  count: number;
}

export interface FeatureCoverageRow {
  code: string;
  nonZeroRate: number;
  mean: number;
  std: number;
}

export interface SegmentSummaryRow {
  segment: string;
  minProbability: number;
  maxProbability: number;
  count: number;
  percent: number;
  meanProbability: number;
  meanCost: number | null;
}

export interface SubgroupMetricRow {
  group: string;
  n: number;
  predictedLowRiskRate: number;
  meanProbability: number;
  actualLowRiskRate: number | null;
  disparity: number;
  auc: number | null;
}

export interface CalibrationRow {
  bucket: string;
  n: number;
  predicted: number;
  actual: number | null;
}

export interface ModelQualityMetrics {
  hasGroundTruthLabel: boolean;
  actualLowRiskRate: number | null;
  predictedLowRiskRate: number;
  auc: number | null;
  brier: number | null;
  precisionAtThreshold: number | null;
  recallAtThreshold: number | null;
}

export interface LowRiskProfileRow {
  metric: string;
  code: string | null;
  lowRisk: number;
  standardRisk: number;
  delta: number;
}

export interface RunAnalytics {
  threshold: number;
  costDistribution: CostDistributionBin[];
  featureCoverage: FeatureCoverageRow[];
  segments: SegmentSummaryRow[];
  subgroupMetrics: SubgroupMetricRow[];
  calibration: CalibrationRow[];
  modelQuality: ModelQualityMetrics;
  lowRiskProfile: LowRiskProfileRow[];
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function std(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const variance =
    values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function computeAuc(scores: number[], labels: number[]): number | null {
  const n = scores.length;
  if (n === 0 || labels.length !== n) return null;

  const entries = scores
    .map((score, idx) => ({ score, label: labels[idx] }))
    .filter((entry) => entry.label === 0 || entry.label === 1)
    .sort((a, b) => a.score - b.score);

  const positives = entries.filter((entry) => entry.label === 1).length;
  const negatives = entries.length - positives;

  if (positives === 0 || negatives === 0) return null;

  let rank = 1;
  let positiveRankSum = 0;

  for (let i = 0; i < entries.length; ) {
    let j = i + 1;
    while (j < entries.length && entries[j].score === entries[i].score) {
      j++;
    }

    const averageRank = (rank + (rank + (j - i) - 1)) / 2;
    for (let k = i; k < j; k++) {
      if (entries[k].label === 1) {
        positiveRankSum += averageRank;
      }
    }

    rank += j - i;
    i = j;
  }

  return (
    (positiveRankSum - (positives * (positives + 1)) / 2) / (positives * negatives)
  );
}

function buildCostDistribution(rawRows: Record<string, unknown>[]): CostDistributionBin[] {
  const bins = [
    { max: 1000, label: "$0-1k", count: 0 },
    { max: 2000, label: "$1k-2k", count: 0 },
    { max: 5000, label: "$2k-5k", count: 0 },
    { max: 10000, label: "$5k-10k", count: 0 },
    { max: 20000, label: "$10k-20k", count: 0 },
    { max: 50000, label: "$20k-50k", count: 0 },
    { max: 100000, label: "$50k-100k", count: 0 },
    { max: Number.POSITIVE_INFINITY, label: "$100k+", count: 0 },
  ];

  for (const row of rawRows) {
    const rawCost = asNumber(row.TOTEXP23);
    const fallback = asNumber(row.LOG_TOTEXP23);
    const cost = rawCost ?? (fallback !== null ? Math.exp(fallback) - 1 : null);
    if (cost === null || cost < 0) continue;

    const targetBin = bins.find((bin) => cost <= bin.max);
    if (targetBin) targetBin.count += 1;
  }

  return bins.map(({ label, count }) => ({ range: label, count }));
}

function buildFeatureCoverage(
  alignedRows: Record<string, number>[]
): FeatureCoverageRow[] {
  if (!alignedRows.length) return [];

  const features = Object.keys(alignedRows[0]);
  const coverage = features.map((feature) => {
    const values = alignedRows.map((row) => row[feature] ?? 0);
    const nonZero = values.filter((value) => value !== 0).length;
    return {
      code: feature,
      nonZeroRate: nonZero / values.length,
      mean: mean(values),
      std: std(values),
    };
  });

  return coverage.sort((a, b) => b.std - a.std);
}

function buildSegments(
  probabilities: number[],
  costs: Array<number | null>
): SegmentSummaryRow[] {
  if (!probabilities.length) return [];

  const ordered = probabilities
    .map((probability, index) => ({ probability, index }))
    .sort((a, b) => a.probability - b.probability);

  const boundaries = [0, 0.25, 0.5, 0.75, 1];
  const segmentNames = ["Q1 (Lowest)", "Q2", "Q3", "Q4 (Highest)"];
  const segments: SegmentSummaryRow[] = [];

  for (let i = 0; i < segmentNames.length; i++) {
    const start = Math.floor(boundaries[i] * ordered.length);
    const end = Math.floor(boundaries[i + 1] * ordered.length);
    const slice = ordered.slice(start, end);
    const probabilitiesInSlice = slice.map((entry) => entry.probability);
    const costsInSlice = slice
      .map((entry) => costs[entry.index])
      .filter((value): value is number => value !== null);

    segments.push({
      segment: segmentNames[i],
      minProbability: probabilitiesInSlice.length
        ? Math.min(...probabilitiesInSlice)
        : 0,
      maxProbability: probabilitiesInSlice.length
        ? Math.max(...probabilitiesInSlice)
        : 0,
      count: slice.length,
      percent: slice.length / ordered.length,
      meanProbability: mean(probabilitiesInSlice),
      meanCost: costsInSlice.length ? mean(costsInSlice) : null,
    });
  }

  return segments;
}

function labelLookup(field: string, value: number | string): string {
  if (field === "SEX") {
    if (Number(value) === 1) return "SEX: Male";
    if (Number(value) === 2) return "SEX: Female";
  }
  if (field === "HISPANX") {
    if (Number(value) === 1) return "HISPANX: Hispanic";
    if (Number(value) === 2) return "HISPANX: Non-Hispanic";
  }
  return `${field}: ${String(value)}`;
}

function buildSubgroupMetrics(
  rawRows: Record<string, unknown>[],
  probabilities: number[],
  labels: Array<number | null>,
  threshold: number
): SubgroupMetricRow[] {
  const fields = ["SEX", "RACETHX", "HISPANX", "POVCAT23", "INSURC23"];
  const overallPredictedRate =
    probabilities.filter((value) => value >= threshold).length /
    Math.max(probabilities.length, 1);

  const output: SubgroupMetricRow[] = [];

  for (const field of fields) {
    if (!rawRows.length || !(field in rawRows[0])) continue;

    const groups = new Map<string, number[]>();

    rawRows.forEach((row, idx) => {
      const value = row[field];
      const key = value === null || value === undefined || value === "" ? "MISSING" : String(value);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(idx);
    });

    const sortedGroups = [...groups.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 8);

    for (const [groupValue, indices] of sortedGroups) {
      if (indices.length < 50) continue;

      const groupProbs = indices.map((idx) => probabilities[idx]);
      const groupLabels = indices
        .map((idx) => labels[idx])
        .filter((label): label is number => label !== null);

      const predictedLowRiskRate =
        groupProbs.filter((value) => value >= threshold).length / groupProbs.length;
      const actualLowRiskRate =
        groupLabels.length > 0 ? mean(groupLabels) : null;
      const auc =
        groupLabels.length === groupProbs.length
          ? computeAuc(groupProbs, groupLabels)
          : null;

      output.push({
        group: labelLookup(field, groupValue),
        n: indices.length,
        predictedLowRiskRate,
        meanProbability: mean(groupProbs),
        actualLowRiskRate,
        disparity:
          overallPredictedRate > 0
            ? predictedLowRiskRate / overallPredictedRate
            : 0,
        auc,
      });
    }
  }

  return output.sort((a, b) => b.n - a.n).slice(0, 15);
}

function buildCalibration(
  probabilities: number[],
  labels: Array<number | null>
): CalibrationRow[] {
  if (!probabilities.length) return [];

  const rows: CalibrationRow[] = [];
  const bins = 10;

  for (let i = 0; i < bins; i++) {
    const start = i / bins;
    const end = (i + 1) / bins;

    const indices = probabilities
      .map((probability, idx) => ({ probability, idx }))
      .filter(
        (entry) =>
          entry.probability >= start &&
          (i === bins - 1 ? entry.probability <= end : entry.probability < end)
      )
      .map((entry) => entry.idx);

    const binProbs = indices.map((idx) => probabilities[idx]);
    const binLabels = indices
      .map((idx) => labels[idx])
      .filter((label): label is number => label !== null);

    rows.push({
      bucket: `${Math.round(start * 100)}-${Math.round(end * 100)}%`,
      n: indices.length,
      predicted: binProbs.length ? mean(binProbs) : 0,
      actual:
        binLabels.length === binProbs.length && binLabels.length > 0
          ? mean(binLabels)
          : null,
    });
  }

  return rows;
}

function buildModelQuality(
  probabilities: number[],
  labels: Array<number | null>,
  threshold: number
): ModelQualityMetrics {
  const predictedLowRiskRate =
    probabilities.filter((value) => value >= threshold).length /
    Math.max(probabilities.length, 1);
  const validLabelIndices = labels
    .map((label, idx) => ({ label, idx }))
    .filter((item): item is { label: number; idx: number } => item.label !== null);
  const hasGroundTruthLabel = validLabelIndices.length === probabilities.length;

  if (!hasGroundTruthLabel) {
    return {
      hasGroundTruthLabel: false,
      actualLowRiskRate: null,
      predictedLowRiskRate,
      auc: null,
      brier: null,
      precisionAtThreshold: null,
      recallAtThreshold: null,
    };
  }

  const y = labels as number[];
  const yHat = probabilities.map((value) => (value >= threshold ? 1 : 0));

  let tp = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < y.length; i++) {
    if (yHat[i] === 1 && y[i] === 1) tp += 1;
    if (yHat[i] === 1 && y[i] === 0) fp += 1;
    if (yHat[i] === 0 && y[i] === 1) fn += 1;
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const brier =
    y.reduce((acc, label, idx) => acc + (probabilities[idx] - label) ** 2, 0) /
    y.length;

  return {
    hasGroundTruthLabel: true,
    actualLowRiskRate: mean(y),
    predictedLowRiskRate,
    auc: computeAuc(probabilities, y),
    brier,
    precisionAtThreshold: precision,
    recallAtThreshold: recall,
  };
}

function buildLowRiskProfile(
  alignedRows: Record<string, number>[],
  rawRows: Record<string, unknown>[],
  probabilities: number[],
  threshold: number
): LowRiskProfileRow[] {
  const lowRiskIndices = probabilities
    .map((value, idx) => ({ value, idx }))
    .filter((item) => item.value >= threshold)
    .map((item) => item.idx);
  const standardIndices = probabilities
    .map((value, idx) => ({ value, idx }))
    .filter((item) => item.value < threshold)
    .map((item) => item.idx);

  const rows: LowRiskProfileRow[] = [];

  const metricDefs: Array<{ code: string; metric: string }> = [
    { code: "AGELAST", metric: "Age" },
    { code: "CHRONIC_CT", metric: "Chronic Condition Count" },
    { code: "LIMIT_CT", metric: "Limitation Count" },
    { code: "K6SUM42", metric: "K6 Distress Score" },
    { code: "PHQ242", metric: "PHQ-2 Score" },
    { code: "PHYEXE53", metric: "Exercise Frequency Code" },
  ];

  for (const { code, metric } of metricDefs) {
    if (!alignedRows.length || !(code in alignedRows[0])) continue;

    const lowRiskValues = lowRiskIndices.map((idx) => alignedRows[idx][code] ?? 0);
    const standardValues = standardIndices.map(
      (idx) => alignedRows[idx][code] ?? 0
    );

    const lowRiskMean = mean(lowRiskValues);
    const standardMean = mean(standardValues);

    rows.push({
      metric,
      code,
      lowRisk: lowRiskMean,
      standardRisk: standardMean,
      delta: lowRiskMean - standardMean,
    });
  }

  const lowCosts = lowRiskIndices
    .map((idx) => asNumber(rawRows[idx]?.TOTEXP23))
    .filter((value): value is number => value !== null);
  const standardCosts = standardIndices
    .map((idx) => asNumber(rawRows[idx]?.TOTEXP23))
    .filter((value): value is number => value !== null);

  if (lowCosts.length && standardCosts.length) {
    const lowCostMean = mean(lowCosts);
    const standardCostMean = mean(standardCosts);
    rows.push({
      metric: "Total Expenditure",
      code: "TOTEXP23",
      lowRisk: lowCostMean,
      standardRisk: standardCostMean,
      delta: lowCostMean - standardCostMean,
    });
  }

  return rows;
}

export function computeRunAnalytics(params: {
  rawRows: Record<string, unknown>[];
  alignedRows: Record<string, number>[];
  probabilities: number[];
  threshold?: number;
}): RunAnalytics {
  const { rawRows, alignedRows, probabilities } = params;
  const threshold = params.threshold ?? 0.7;

  const labels = rawRows.map((row) => {
    const label = asNumber(row.LOW_RISK);
    if (label === 0 || label === 1) return label;
    return null;
  });

  const costs = rawRows.map((row) => asNumber(row.TOTEXP23));

  return {
    threshold,
    costDistribution: buildCostDistribution(rawRows),
    featureCoverage: buildFeatureCoverage(alignedRows),
    segments: buildSegments(probabilities, costs),
    subgroupMetrics: buildSubgroupMetrics(rawRows, probabilities, labels, threshold),
    calibration: buildCalibration(probabilities, labels),
    modelQuality: buildModelQuality(probabilities, labels, threshold),
    lowRiskProfile: buildLowRiskProfile(
      alignedRows,
      rawRows,
      probabilities,
      threshold
    ),
  };
}
