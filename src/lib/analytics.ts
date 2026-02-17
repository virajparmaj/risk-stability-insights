import type { RunState, ScoredRow } from "@/contexts/DataContext";
import type { ReplacementStat } from "@/lib/runAnalytics";

const DEFAULT_THRESHOLD = 0.7;
const LOG_COST_CAP = 16;
const CATASTROPHIC_COST = 20_000;

export interface QuantileSummary {
  p10: number;
  p50: number;
  p90: number;
}

export interface SegmentQuantileSummary {
  id: number;
  name: string;
  minRisk: number;
  maxRisk: number;
  size: number;
  share: number;
  meanRisk: number;
  meanCost: number;
  costVariance: number;
  catastrophicRate: number;
}

export interface MissingnessSummary {
  totalCoerced: number;
  coercedRate: number;
  topCoercedFeatures: ReplacementStat[];
}

export interface CorrelationSummary {
  pearson: number | null;
  spearman: number | null;
}

export interface TailShareSummary {
  top10MemberCostShare: number;
  top1MemberCostShare: number;
  membersForTop10CostShare: number;
  membersForTop1CostShare: number;
}

export interface RunAnalyticsSummary {
  nMembers: number;
  threshold: number;
  lowRiskCount: number;
  lowRiskRate: number;
  meanRisk: number;
  medianRisk: number;
  riskQuantiles: QuantileSummary;
  costAvailable: boolean;
  meanCost: number;
  medianCost: number;
  costQuantiles: QuantileSummary;
  totalCost: number;
  zeroCostRate: number;
  tailShares: TailShareSummary;
  correlation: CorrelationSummary;
  catastrophicRate: number;
  segments: SegmentQuantileSummary[];
  missingness: MissingnessSummary;
  labelsAvailable: boolean;
  actualLowRiskRate: number | null;
}

export interface RunPoint {
  idx: number;
  risk: number;
  cost: number;
  label: number | null;
}

export interface FairnessGroupStat {
  field: string;
  group: string;
  n: number;
  meanRisk: number;
  lowRiskRate: number;
  meanCost: number;
  actualLowRiskRate: number | null;
}

export interface ProfileContrast {
  feature: string;
  lowRiskMean: number;
  restMean: number;
  delta: number;
}

export interface BootstrapRateCI {
  iterations: number;
  lower: number;
  upper: number;
  mean: number;
  width: number;
}

export interface ThresholdSensitivityPoint {
  threshold: number;
  lowRiskRate: number;
}

export interface SegmentDriver {
  feature: string;
  segmentMean: number;
  overallMean: number;
  delta: number;
}

const analyticsCache = new Map<string, RunAnalyticsSummary>();
const pointCache = new Map<string, RunPoint[]>();
const fairnessCache = new Map<string, FairnessGroupStat[]>();
const profileCache = new Map<string, ProfileContrast[]>();
const bootstrapCache = new Map<string, BootstrapRateCI>();
const thresholdCache = new Map<string, ThresholdSensitivityPoint[]>();

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function variance(values: number[]): number {
  if (values.length <= 1) return 0;
  const avg = mean(values);
  return values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
}

function quantile(sortedValues: number[], q: number): number {
  if (!sortedValues.length) return 0;
  if (q <= 0) return sortedValues[0];
  if (q >= 1) return sortedValues[sortedValues.length - 1];

  const position = (sortedValues.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const weight = position - lower;
  return (
    sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
  );
}

function summarizeQuantiles(values: number[]): QuantileSummary {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    p10: quantile(sorted, 0.1),
    p50: quantile(sorted, 0.5),
    p90: quantile(sorted, 0.9),
  };
}

function buildRanks(values: number[]): number[] {
  const indexed = values
    .map((value, idx) => ({ value, idx }))
    .sort((a, b) => a.value - b.value);
  const ranks = Array(values.length).fill(0);

  for (let i = 0; i < indexed.length; ) {
    let j = i + 1;
    while (j < indexed.length && indexed[j].value === indexed[i].value) {
      j += 1;
    }

    const avgRank = (i + j - 1) / 2 + 1;
    for (let k = i; k < j; k += 1) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j;
  }

  return ranks;
}

function pearsonCorrelation(x: number[], y: number[]): number | null {
  if (!x.length || x.length !== y.length) return null;
  const xMean = mean(x);
  const yMean = mean(y);

  let numerator = 0;
  let xVar = 0;
  let yVar = 0;

  for (let i = 0; i < x.length; i += 1) {
    const xd = x[i] - xMean;
    const yd = y[i] - yMean;
    numerator += xd * yd;
    xVar += xd * xd;
    yVar += yd * yd;
  }

  if (xVar === 0 || yVar === 0) return null;
  return numerator / Math.sqrt(xVar * yVar);
}

function spearmanCorrelation(x: number[], y: number[]): number | null {
  if (!x.length || x.length !== y.length) return null;
  const xRanks = buildRanks(x);
  const yRanks = buildRanks(y);
  return pearsonCorrelation(xRanks, yRanks);
}

function getThreshold(run: RunState): number {
  return run.analytics?.threshold ?? DEFAULT_THRESHOLD;
}

export function getScoredRows(run: RunState): ScoredRow[] {
  if (run.scoredRows?.length) return run.scoredRows;
  return run.results ?? [];
}

export function getAlignedRows(run: RunState): Record<string, number>[] {
  return run.alignedRows ?? [];
}

function getCostFromRows(
  sourceRow: Record<string, string | number | null> | undefined,
  alignedRow: Record<string, number> | undefined
): number {
  const rawLog =
    toFiniteNumber(sourceRow?.LOG_TOTEXP23) ??
    toFiniteNumber(sourceRow?.LOG_TOTEXP) ??
    toFiniteNumber(alignedRow?.LOG_TOTEXP23) ??
    toFiniteNumber(alignedRow?.LOG_TOTEXP);

  if (rawLog !== null) {
    const clamped = Math.min(rawLog, LOG_COST_CAP);
    const expanded = Math.exp(clamped);
    if (Number.isFinite(expanded)) {
      return Math.max(0, expanded);
    }
  }

  const directCost =
    toFiniteNumber(sourceRow?.TOTEXP23) ??
    toFiniteNumber(sourceRow?.TOTEXP) ??
    toFiniteNumber(alignedRow?.TOTEXP23) ??
    toFiniteNumber(alignedRow?.TOTEXP);

  return directCost !== null ? Math.max(0, directCost) : 0;
}

function getLabelFromRow(
  sourceRow: Record<string, string | number | null> | undefined
): number | null {
  const label = toFiniteNumber(sourceRow?.LOW_RISK);
  if (label === 0 || label === 1) return label;
  return null;
}

function computeTailShares(costs: number[]): TailShareSummary {
  if (!costs.length) {
    return {
      top10MemberCostShare: 0,
      top1MemberCostShare: 0,
      membersForTop10CostShare: 0,
      membersForTop1CostShare: 0,
    };
  }

  const sortedDesc = [...costs].sort((a, b) => b - a);
  const total = costs.reduce((acc, value) => acc + value, 0);

  if (total <= 0) {
    return {
      top10MemberCostShare: 0,
      top1MemberCostShare: 0,
      membersForTop10CostShare: 0,
      membersForTop1CostShare: 0,
    };
  }

  const top10Count = Math.max(1, Math.floor(sortedDesc.length * 0.1));
  const top1Count = Math.max(1, Math.floor(sortedDesc.length * 0.01));

  const top10Cost =
    sortedDesc.slice(0, top10Count).reduce((acc, value) => acc + value, 0) / total;
  const top1Cost =
    sortedDesc.slice(0, top1Count).reduce((acc, value) => acc + value, 0) / total;

  let cumulative = 0;
  let membersForTop10CostShare = 0;
  let membersForTop1CostShare = 0;
  const top10Target = total * 0.1;
  const top1Target = total * 0.01;

  for (let i = 0; i < sortedDesc.length; i += 1) {
    cumulative += sortedDesc[i];
    if (membersForTop1CostShare === 0 && cumulative >= top1Target) {
      membersForTop1CostShare = i + 1;
    }
    if (membersForTop10CostShare === 0 && cumulative >= top10Target) {
      membersForTop10CostShare = i + 1;
      break;
    }
  }

  if (membersForTop10CostShare === 0) {
    membersForTop10CostShare = sortedDesc.length;
  }
  if (membersForTop1CostShare === 0) {
    membersForTop1CostShare = sortedDesc.length;
  }

  return {
    top10MemberCostShare: top10Cost,
    top1MemberCostShare: top1Cost,
    membersForTop10CostShare,
    membersForTop1CostShare,
  };
}

function computeSegments(
  risks: number[],
  costs: number[]
): SegmentQuantileSummary[] {
  if (!risks.length) return [];

  const ordered = risks
    .map((risk, idx) => ({ risk, cost: costs[idx] }))
    .sort((a, b) => a.risk - b.risk);

  const segments: SegmentQuantileSummary[] = [];
  const names = ["Q1 (Lowest)", "Q2", "Q3", "Q4 (Highest)"];

  for (let i = 0; i < 4; i += 1) {
    const start = Math.floor((i * ordered.length) / 4);
    const end = i === 3 ? ordered.length : Math.floor(((i + 1) * ordered.length) / 4);
    const slice = ordered.slice(start, end);
    const segmentRisks = slice.map((entry) => entry.risk);
    const segmentCosts = slice.map((entry) => entry.cost);

    segments.push({
      id: i + 1,
      name: names[i],
      minRisk: segmentRisks.length ? Math.min(...segmentRisks) : 0,
      maxRisk: segmentRisks.length ? Math.max(...segmentRisks) : 0,
      size: slice.length,
      share: slice.length / ordered.length,
      meanRisk: mean(segmentRisks),
      meanCost: mean(segmentCosts),
      costVariance: variance(segmentCosts),
      catastrophicRate:
        segmentCosts.filter((value) => value >= CATASTROPHIC_COST).length /
        Math.max(segmentCosts.length, 1),
    });
  }

  return segments;
}

function computeMissingness(run: RunState): MissingnessSummary {
  const rowCount = run.dataQuality?.rowCount ?? 0;
  const featureCount = run.dataQuality?.requiredFeatureCount ?? 0;
  const totalCells = rowCount * featureCount;
  const totalCoerced = run.dataQuality?.replacedValueCount ?? 0;

  return {
    totalCoerced,
    coercedRate: totalCells > 0 ? totalCoerced / totalCells : 0,
    topCoercedFeatures:
      run.dataQuality?.replacementStats?.slice(0, 10) ?? [],
  };
}

export function computeRunSummary(run: RunState): RunAnalyticsSummary {
  const cached = analyticsCache.get(run.id);
  if (cached) return cached;

  const scoredRows = getScoredRows(run);
  const alignedRows = getAlignedRows(run);
  const sourceRows = run.sourceRows ?? [];
  const threshold = getThreshold(run);

  const risks: number[] = [];
  const costs: number[] = [];
  const labels: Array<number | null> = [];

  for (let i = 0; i < scoredRows.length; i += 1) {
    const risk = scoredRows[i].low_risk_probability;
    const sourceRow = sourceRows[i];
    const alignedRow = alignedRows[i];

    risks.push(Number.isFinite(risk) ? risk : 0);
    costs.push(getCostFromRows(sourceRow, alignedRow));
    labels.push(getLabelFromRow(sourceRow));
  }

  const nMembers = risks.length;
  const lowRiskCount = risks.filter((value) => value >= threshold).length;
  const lowRiskRate = nMembers > 0 ? lowRiskCount / nMembers : 0;

  const riskQuantiles = summarizeQuantiles(risks);
  const costQuantiles = summarizeQuantiles(costs);
  const totalCost = costs.reduce((acc, value) => acc + value, 0);
  const zeroCostRate =
    costs.filter((value) => value === 0).length / Math.max(costs.length, 1);
  const tailShares = computeTailShares(costs);
  const segments = computeSegments(risks, costs);
  const missingness = computeMissingness(run);

  const validLabels = labels.filter(
    (value): value is number => value === 0 || value === 1
  );
  const labelsAvailable = validLabels.length === labels.length && labels.length > 0;

  const summary: RunAnalyticsSummary = {
    nMembers,
    threshold,
    lowRiskCount,
    lowRiskRate,
    meanRisk: mean(risks),
    medianRisk: riskQuantiles.p50,
    riskQuantiles,
    costAvailable: costs.some((value) => value > 0),
    meanCost: mean(costs),
    medianCost: costQuantiles.p50,
    costQuantiles,
    totalCost,
    zeroCostRate,
    tailShares,
    correlation: {
      pearson: pearsonCorrelation(risks, costs),
      spearman: spearmanCorrelation(risks, costs),
    },
    catastrophicRate:
      costs.filter((value) => value >= CATASTROPHIC_COST).length /
      Math.max(costs.length, 1),
    segments,
    missingness,
    labelsAvailable,
    actualLowRiskRate: labelsAvailable ? mean(validLabels) : null,
  };

  analyticsCache.set(run.id, summary);
  return summary;
}

export function getRunPoints(run: RunState): RunPoint[] {
  const cached = pointCache.get(run.id);
  if (cached) return cached;

  const scoredRows = getScoredRows(run);
  const sourceRows = run.sourceRows ?? [];
  const alignedRows = getAlignedRows(run);

  const points = scoredRows.map((row, idx) => ({
    idx,
    risk: row.low_risk_probability,
    cost: getCostFromRows(sourceRows[idx], alignedRows[idx]),
    label: getLabelFromRow(sourceRows[idx]),
  }));

  pointCache.set(run.id, points);
  return points;
}

function getFieldValue(
  field: string,
  sourceRow: Record<string, string | number | null> | undefined,
  alignedRow: Record<string, number> | undefined
): string | null {
  if (field === "AGE") {
    const age =
      toFiniteNumber(sourceRow?.AGELAST) ??
      toFiniteNumber(sourceRow?.AGE) ??
      toFiniteNumber(alignedRow?.AGELAST) ??
      toFiniteNumber(alignedRow?.AGE);

    if (age === null) return null;
    if (age < 35) return "18-34";
    if (age < 50) return "35-49";
    if (age < 65) return "50-64";
    return "65+";
  }

  const sourceValue = sourceRow?.[field];
  if (sourceValue !== undefined && sourceValue !== null && sourceValue !== "") {
    return String(sourceValue);
  }

  const alignedValue = alignedRow?.[field];
  if (alignedValue !== undefined && alignedValue !== null) {
    return String(alignedValue);
  }

  return null;
}

export function computeFairnessGroupStats(
  run: RunState,
  fields: string[] = ["SEX", "RACETHX", "REGION", "AGE"]
): FairnessGroupStat[] {
  const cacheKey = `${run.id}:${fields.join("|")}`;
  const cached = fairnessCache.get(cacheKey);
  if (cached) return cached;

  const scoredRows = getScoredRows(run);
  const sourceRows = run.sourceRows ?? [];
  const alignedRows = getAlignedRows(run);
  const threshold = getThreshold(run);

  const output: FairnessGroupStat[] = [];

  for (const field of fields) {
    const buckets = new Map<
      string,
      { risks: number[]; costs: number[]; labels: number[] }
    >();

    for (let idx = 0; idx < scoredRows.length; idx += 1) {
      const groupValue = getFieldValue(field, sourceRows[idx], alignedRows[idx]);
      if (!groupValue) continue;

      if (!buckets.has(groupValue)) {
        buckets.set(groupValue, { risks: [], costs: [], labels: [] });
      }

      const bucket = buckets.get(groupValue)!;
      bucket.risks.push(scoredRows[idx].low_risk_probability);
      bucket.costs.push(getCostFromRows(sourceRows[idx], alignedRows[idx]));
      const label = getLabelFromRow(sourceRows[idx]);
      if (label !== null) bucket.labels.push(label);
    }

    for (const [group, values] of buckets.entries()) {
      if (values.risks.length < 100) continue;
      output.push({
        field,
        group,
        n: values.risks.length,
        meanRisk: mean(values.risks),
        lowRiskRate:
          values.risks.filter((value) => value >= threshold).length /
          values.risks.length,
        meanCost: mean(values.costs),
        actualLowRiskRate:
          values.labels.length === values.risks.length
            ? mean(values.labels)
            : null,
      });
    }
  }

  const sorted = output.sort((a, b) => {
    if (a.field !== b.field) return a.field.localeCompare(b.field);
    return b.n - a.n;
  });

  fairnessCache.set(cacheKey, sorted);
  return sorted;
}

export function computeProfileContrasts(
  run: RunState,
  featureCodes: string[] = [
    "OBTOTV23",
    "OPTOTV23",
    "RXTOT23",
    "EMPST53",
    "MARRY53X",
    "EDUCYR",
    "K6SUM42",
    "PHQ242",
  ]
): ProfileContrast[] {
  const cacheKey = `${run.id}:${featureCodes.join("|")}`;
  const cached = profileCache.get(cacheKey);
  if (cached) return cached;

  const alignedRows = getAlignedRows(run);
  const scoredRows = getScoredRows(run);
  if (!alignedRows.length || !scoredRows.length) return [];

  const threshold = getThreshold(run);
  const lowRiskIndices: number[] = [];
  const restIndices: number[] = [];

  for (let i = 0; i < scoredRows.length; i += 1) {
    if (scoredRows[i].low_risk_probability >= threshold) {
      lowRiskIndices.push(i);
    } else {
      restIndices.push(i);
    }
  }

  const contrasts: ProfileContrast[] = [];
  const featureSet = new Set(Object.keys(alignedRows[0]));

  for (const feature of featureCodes) {
    if (feature === "TOTEXP23" || feature === "TOTEXP") {
      const lowCosts = lowRiskIndices.map((idx) =>
        getCostFromRows(run.sourceRows?.[idx], alignedRows[idx])
      );
      const restCosts = restIndices.map((idx) =>
        getCostFromRows(run.sourceRows?.[idx], alignedRows[idx])
      );
      const lowMean = mean(lowCosts);
      const restMean = mean(restCosts);
      contrasts.push({
        feature: "TOTEXP23",
        lowRiskMean: lowMean,
        restMean,
        delta: lowMean - restMean,
      });
      continue;
    }

    if (!featureSet.has(feature)) continue;

    const lowValues = lowRiskIndices.map((idx) => alignedRows[idx][feature] ?? 0);
    const restValues = restIndices.map((idx) => alignedRows[idx][feature] ?? 0);
    const lowMean = mean(lowValues);
    const restMean = mean(restValues);

    contrasts.push({
      feature,
      lowRiskMean: lowMean,
      restMean,
      delta: lowMean - restMean,
    });
  }

  const sorted = contrasts.sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta)
  );
  profileCache.set(cacheKey, sorted);
  return sorted;
}

function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

export function computeBootstrapLowRiskRateCI(
  run: RunState,
  iterations: number = 200,
  seed: number = 42
): BootstrapRateCI {
  const cacheKey = `${run.id}:${iterations}:${seed}`;
  const cached = bootstrapCache.get(cacheKey);
  if (cached) return cached;

  const scoredRows = getScoredRows(run);
  const threshold = getThreshold(run);

  if (!scoredRows.length) {
    const empty = { iterations, lower: 0, upper: 0, mean: 0, width: 0 };
    bootstrapCache.set(cacheKey, empty);
    return empty;
  }

  const rng = seededRng(seed);
  const sampleRates: number[] = [];
  const n = scoredRows.length;

  for (let i = 0; i < iterations; i += 1) {
    let positives = 0;
    for (let j = 0; j < n; j += 1) {
      const idx = Math.floor(rng() * n);
      if (scoredRows[idx].low_risk_probability >= threshold) positives += 1;
    }
    sampleRates.push(positives / n);
  }

  sampleRates.sort((a, b) => a - b);
  const lower = quantile(sampleRates, 0.025);
  const upper = quantile(sampleRates, 0.975);
  const result = {
    iterations,
    lower,
    upper,
    mean: mean(sampleRates),
    width: upper - lower,
  };
  bootstrapCache.set(cacheKey, result);
  return result;
}

export function computeThresholdSensitivity(
  run: RunState,
  thresholds: number[] = [0.65, 0.67, 0.69, 0.7, 0.71, 0.73, 0.75]
): ThresholdSensitivityPoint[] {
  const cacheKey = `${run.id}:${thresholds.join(",")}`;
  const cached = thresholdCache.get(cacheKey);
  if (cached) return cached;

  const scoredRows = getScoredRows(run);
  const points = thresholds.map((threshold) => {
    const lowRiskRate =
      scoredRows.filter(
        (row) => row.low_risk_probability >= threshold
      ).length / Math.max(scoredRows.length, 1);

    return {
      threshold,
      lowRiskRate,
    };
  });

  thresholdCache.set(cacheKey, points);
  return points;
}

export function computeSegmentDrivers(
  run: RunState,
  segmentName: string,
  limit: number = 3
): SegmentDriver[] {
  const summary = computeRunSummary(run);
  const segment = summary.segments.find((entry) => entry.name === segmentName);
  const alignedRows = getAlignedRows(run);
  const scoredRows = getScoredRows(run);

  if (!segment || !alignedRows.length || !scoredRows.length) return [];

  const featureCodes = Object.keys(alignedRows[0]).slice(0, 60);
  const indices = scoredRows
    .map((row, idx) => ({ row, idx }))
    .filter(
      (entry) =>
        entry.row.low_risk_probability >= segment.minRisk &&
        entry.row.low_risk_probability <= segment.maxRisk
    )
    .map((entry) => entry.idx);

  if (!indices.length) return [];

  const drivers: SegmentDriver[] = [];

  for (const feature of featureCodes) {
    const segmentValues = indices.map((idx) => alignedRows[idx][feature] ?? 0);
    const overallValues = alignedRows.map((row) => row[feature] ?? 0);
    const segmentMean = mean(segmentValues);
    const overallMean = mean(overallValues);
    drivers.push({
      feature,
      segmentMean,
      overallMean,
      delta: segmentMean - overallMean,
    });
  }

  return drivers
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, limit);
}

export function groupRequiredFeatures(
  requiredFeatures: string[]
): Record<string, string[]> {
  const groups: Record<string, string[]> = {
    "Utilization & Cost": [],
    "Mental Health & Well-Being": [],
    "Demographics & SES": [],
    "Chronic Conditions": [],
    "Functional Limitations": [],
    Behavior: [],
    Other: [],
  };

  for (const feature of requiredFeatures) {
    if (/(TOT|EXP|RX|ER|IP|OB|OP|LOG_TOTEXP)/.test(feature)) {
      groups["Utilization & Cost"].push(feature);
      continue;
    }
    if (/(K6|PHQ|MNHLTH|RTHLTH)/.test(feature)) {
      groups["Mental Health & Well-Being"].push(feature);
      continue;
    }
    if (/(AGE|SEX|RACE|HISP|POV|FAMINC|EDUC|MARRY|EMPST|INSUR|REGION)/.test(feature)) {
      groups["Demographics & SES"].push(feature);
      continue;
    }
    if (/(DX|CHRONIC|DIAB|HIBP|CHD|ASTH|CANCER|ARTH)/.test(feature)) {
      groups["Chronic Conditions"].push(feature);
      continue;
    }
    if (/(LIM|ADL|IADL|WLK|COG|WRK|SOC)/.test(feature)) {
      groups["Functional Limitations"].push(feature);
      continue;
    }
    if (/(PHYEXE|OFTSMK)/.test(feature)) {
      groups.Behavior.push(feature);
      continue;
    }
    groups.Other.push(feature);
  }

  return groups;
}
