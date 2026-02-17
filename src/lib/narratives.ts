import type {
  BootstrapRateCI,
  FairnessGroupStat,
  ProfileContrast,
  RunAnalyticsSummary,
  SegmentQuantileSummary,
  ThresholdSensitivityPoint,
} from "@/lib/analytics";
import { getFeatureLabel } from "@/lib/featureLabels";

function fmtInt(value: number): string {
  return value.toLocaleString();
}

function fmtPct(value: number, digits: number = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function fmtNum(value: number, digits: number = 3): string {
  return value.toFixed(digits);
}

function fmtCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function describeCorrelation(value: number | null): string {
  if (value === null) return "no measurable";
  const abs = Math.abs(value);
  if (abs < 0.15) return "very weak";
  if (abs < 0.35) return "weak";
  if (abs < 0.55) return "moderate";
  if (abs < 0.75) return "strong";
  return "very strong";
}

export function overviewInsights(summary: RunAnalyticsSummary): string[] {
  const lines = [
    `Scored ${fmtInt(summary.nMembers)} members; average low-risk score is ${fmtNum(summary.meanRisk)} and median is ${fmtNum(summary.medianRisk)}.`,
    `${fmtPct(summary.lowRiskRate, 2)} of members are above the low-risk threshold p ≥ ${summary.threshold.toFixed(2)} (${fmtInt(summary.lowRiskCount)} members).`,
    `Score spread is p10 ${fmtNum(summary.riskQuantiles.p10)}, p50 ${fmtNum(summary.riskQuantiles.p50)}, p90 ${fmtNum(summary.riskQuantiles.p90)}.`,
  ];

  if (summary.costAvailable) {
    lines.push(
      `Cost median is ${fmtCurrency(summary.costQuantiles.p50)} and p90 is ${fmtCurrency(summary.costQuantiles.p90)}; top 10% of members account for ${fmtPct(summary.tailShares.top10MemberCostShare, 1)} of total cost.`
    );
  }

  lines.push(
    `Risk-cost association is ${describeCorrelation(summary.correlation.spearman)} (Spearman ${summary.correlation.spearman?.toFixed(3) ?? "N/A"}), useful for retention and pricing segmentation.`
  );

  return lines.slice(0, 6);
}

export function riskDistributionInsights(summary: RunAnalyticsSummary): string[] {
  return [
    `Distribution centers at median ${fmtNum(summary.riskQuantiles.p50)} with upper decile at ${fmtNum(summary.riskQuantiles.p90)}.`,
    `${fmtPct(summary.lowRiskRate, 2)} of members clear p ≥ ${summary.threshold.toFixed(2)}, indicating a relatively selective low-risk cohort.`,
    `Inter-decile spread (p90 - p10) is ${fmtNum(
      summary.riskQuantiles.p90 - summary.riskQuantiles.p10
    )}, which shows how separated the score tail is.`,
  ];
}

export function costDistributionInsights(summary: RunAnalyticsSummary): string[] {
  if (!summary.costAvailable) {
    return ["Cost fields are not available in this run, so cost-based insights cannot be computed."];
  }

  return [
    `Median cost is ${fmtCurrency(summary.costQuantiles.p50)} and p90 is ${fmtCurrency(summary.costQuantiles.p90)}.`,
    `${fmtPct(summary.zeroCostRate, 2)} of members have zero cost in the available cost field.`,
    `Top 10% of members contribute ${fmtPct(summary.tailShares.top10MemberCostShare, 1)} of cost; top 1% contribute ${fmtPct(summary.tailShares.top1MemberCostShare, 1)}.`,
    `${fmtInt(summary.tailShares.membersForTop10CostShare)} members are enough to reach 10% of total cost, indicating cost concentration.`,
  ];
}

export function segmentationInsights(
  segments: SegmentQuantileSummary[],
  summary: RunAnalyticsSummary
): string[] {
  if (!segments.length) {
    return ["No segmentation output is available for this run."];
  }

  const highestCost = [...segments].sort((a, b) => b.meanCost - a.meanCost)[0];
  const lowestRisk = [...segments].sort((a, b) => a.meanRisk - b.meanRisk)[0];
  const highestCatastrophic = [...segments].sort(
    (a, b) => b.catastrophicRate - a.catastrophicRate
  )[0];

  return [
    `Members are split into ${segments.length} equal risk-quantile segments (${fmtInt(summary.nMembers)} total).`,
    `${highestCost.name} has the highest mean cost (${fmtCurrency(
      highestCost.meanCost
    )}), while ${lowestRisk.name} has the lowest mean risk (${fmtNum(
      lowestRisk.meanRisk
    )}).`,
    `Catastrophic cost rate peaks in ${highestCatastrophic.name} at ${fmtPct(
      highestCatastrophic.catastrophicRate,
      2
    )} vs overall ${fmtPct(summary.catastrophicRate, 2)}.`,
  ];
}

export function fairnessInsights(
  groupStats: FairnessGroupStat[],
  overallLowRiskRate: number
): string[] {
  if (!groupStats.length) {
    return ["Fairness analysis unavailable because required group features are missing."];
  }

  const sortedByRate = [...groupStats].sort((a, b) => b.lowRiskRate - a.lowRiskRate);
  const highest = sortedByRate[0];
  const lowest = sortedByRate[sortedByRate.length - 1];
  const gap = highest.lowRiskRate - lowest.lowRiskRate;

  return [
    `Computed fairness metrics for ${groupStats.length} groups across available demographic fields.`,
    `Highest low-risk rate is ${fmtPct(highest.lowRiskRate, 2)} (${highest.field}:${highest.group}); lowest is ${fmtPct(lowest.lowRiskRate, 2)} (${lowest.field}:${lowest.group}).`,
    `Absolute gap is ${fmtPct(gap, 2)} against an overall low-risk rate of ${fmtPct(
      overallLowRiskRate,
      2
    )}.`,
    `Largest gaps identify where retention/policy review should focus first.`,
  ];
}

export function lowRiskProfileInsights(
  contrasts: ProfileContrast[],
  summary: RunAnalyticsSummary
): string[] {
  if (!contrasts.length) {
    return ["Profile contrasts are unavailable because aligned feature rows are missing."];
  }

  const top = contrasts.slice(0, 3);

  return [
    `Low-risk cohort size is ${fmtInt(summary.lowRiskCount)} (${fmtPct(
      summary.lowRiskRate,
      2
    )}) at threshold p ≥ ${summary.threshold.toFixed(2)}.`,
    ...top.map(
      (item) =>
        `${getFeatureLabel(item.feature)} differs by ${fmtNum(item.delta, 3)} (low-risk ${fmtNum(
          item.lowRiskMean,
          3
        )} vs rest ${fmtNum(item.restMean, 3)}).`
    ),
  ].slice(0, 6);
}

export function scoringInsights(
  summary: RunAnalyticsSummary,
  selectedRate: number,
  mode: "threshold" | "rank"
): string[] {
  const base = [
    `Scoring run covers ${fmtInt(summary.nMembers)} members with mean score ${fmtNum(
      summary.meanRisk
    )}.`,
    `Current selection mode is ${mode === "threshold" ? "threshold" : "top-rank"} with selected share ${fmtPct(
      selectedRate,
      2
    )}.`,
    `Score spread (p10/p50/p90) is ${fmtNum(summary.riskQuantiles.p10)} / ${fmtNum(
      summary.riskQuantiles.p50
    )} / ${fmtNum(summary.riskQuantiles.p90)}.`,
  ];

  if (summary.labelsAvailable && summary.actualLowRiskRate !== null) {
    base.push(
      `Observed LOW_RISK label rate is ${fmtPct(summary.actualLowRiskRate, 2)} for this file.`
    );
  }

  return base.slice(0, 6);
}

export function riskLabInsights(
  summary: RunAnalyticsSummary,
  ci: BootstrapRateCI,
  sensitivity: ThresholdSensitivityPoint[]
): string[] {
  const maxRate = sensitivity.length
    ? Math.max(...sensitivity.map((item) => item.lowRiskRate))
    : summary.lowRiskRate;
  const minRate = sensitivity.length
    ? Math.min(...sensitivity.map((item) => item.lowRiskRate))
    : summary.lowRiskRate;

  return [
    `Bootstrap CI (${ci.iterations} resamples) for low-risk rate is ${fmtPct(
      ci.lower,
      2
    )} to ${fmtPct(ci.upper, 2)} (width ${fmtPct(ci.width, 2)}).`,
    `Threshold sweep ${sensitivity[0]?.threshold.toFixed(2) ?? "N/A"}-${sensitivity[sensitivity.length - 1]?.threshold.toFixed(2) ?? "N/A"} changes low-risk rate from ${fmtPct(
      minRate,
      2
    )} to ${fmtPct(maxRate, 2)}.`,
    `Current threshold ${summary.threshold.toFixed(2)} yields ${fmtPct(
      summary.lowRiskRate,
      2
    )}, useful as the operational baseline.`,
  ];
}

export function reportsExecutiveSummary(
  summary: RunAnalyticsSummary,
  segments: SegmentQuantileSummary[]
): string[] {
  const highestCost = segments.length
    ? [...segments].sort((a, b) => b.meanCost - a.meanCost)[0]
    : null;
  const lowestRisk = segments.length
    ? [...segments].sort((a, b) => a.meanRisk - b.meanRisk)[0]
    : null;

  const lines = [
    `Scored ${fmtInt(summary.nMembers)} members using threshold p ≥ ${summary.threshold.toFixed(2)}.`,
    `Low-risk share is ${fmtPct(summary.lowRiskRate, 2)} (${fmtInt(summary.lowRiskCount)} members).`,
    `Mean/median low-risk score is ${fmtNum(summary.meanRisk)} / ${fmtNum(
      summary.medianRisk
    )}.`,
    `Score p10/p90 are ${fmtNum(summary.riskQuantiles.p10)} and ${fmtNum(
      summary.riskQuantiles.p90
    )}.`,
  ];

  if (summary.costAvailable) {
    lines.push(
      `Median/p90 cost are ${fmtCurrency(summary.costQuantiles.p50)} / ${fmtCurrency(
        summary.costQuantiles.p90
      )}.`
    );
    lines.push(
      `Top 10% of members account for ${fmtPct(
        summary.tailShares.top10MemberCostShare,
        1
      )} of cost.`
    );
  }

  if (highestCost && lowestRisk) {
    lines.push(
      `${highestCost.name} has highest mean cost (${fmtCurrency(
        highestCost.meanCost
      )}); ${lowestRisk.name} has lowest mean risk (${fmtNum(lowestRisk.meanRisk)}).`
    );
  }

  lines.push(
    `Data quality coercions: ${fmtInt(summary.missingness.totalCoerced)} cells (${fmtPct(
      summary.missingness.coercedRate,
      2
    )}).`
  );

  return lines.slice(0, 10);
}
