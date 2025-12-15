// src/lib/alignFeatures.ts

/**
 * Align raw MEPS rows to the exact model-required feature schema.
 * - Keeps only required features
 * - Fills missing features with 0
 * - Coerces values to numbers
 * - Guarantees backend contract
 */

export function alignFeatures(
  rawRows: Record<string, any>[],
  requiredFeatures: string[]
): Record<string, number>[] {
  return rawRows.map((r) => {
    const aligned: Record<string, number> = {};

    requiredFeatures.forEach((feature) => {
      const v = r[feature];
      aligned[feature] =
        v === undefined || v === null || v === "" || Number.isNaN(Number(v))
          ? 0
          : Number(v);
    });

    return aligned;
  });
}