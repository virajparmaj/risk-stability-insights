// src/lib/alignFeatures.ts

/**
 * Align raw MEPS rows to the exact model-required feature schema.
 * - Keeps only required features
 * - Coerces values to numbers
 * - Replaces invalid/missing values with 0 and returns diagnostics
 */

export interface AlignmentStat {
  feature: string;
  replacedWithZero: number;
}

export interface AlignmentResult {
  rows: Record<string, number>[];
  missingRequiredFeatures: string[];
  replacementStats: AlignmentStat[];
  totalReplacedWithZero: number;
}

export function alignFeatures(
  rawRows: Record<string, unknown>[],
  requiredFeatures: string[]
): AlignmentResult {
  const presentColumns = new Set(
    rawRows.length ? Object.keys(rawRows[0]) : []
  );
  const missingRequiredFeatures = requiredFeatures.filter(
    (feature) => !presentColumns.has(feature)
  );

  const replacementMap = new Map<string, number>();
  requiredFeatures.forEach((feature) => replacementMap.set(feature, 0));

  const rows = rawRows.map((row) => {
    const aligned: Record<string, number> = {};

    requiredFeatures.forEach((feature) => {
      const value = row[feature];
      const numeric = Number(value);

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        Number.isNaN(numeric)
      ) {
        aligned[feature] = 0;
        replacementMap.set(
          feature,
          (replacementMap.get(feature) ?? 0) + 1
        );
      } else {
        aligned[feature] = numeric;
      }
    });

    return aligned;
  });

  const replacementStats = [...replacementMap.entries()]
    .map(([feature, replacedWithZero]) => ({ feature, replacedWithZero }))
    .filter((item) => item.replacedWithZero > 0)
    .sort((a, b) => b.replacedWithZero - a.replacedWithZero);

  const totalReplacedWithZero = replacementStats.reduce(
    (acc, item) => acc + item.replacedWithZero,
    0
  );

  return {
    rows,
    missingRequiredFeatures,
    replacementStats,
    totalReplacedWithZero,
  };
}
