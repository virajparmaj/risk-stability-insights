// src/lib/exportCsv.ts

import { getFeatureLabel } from './featureLabels';

/**
 * Export data to CSV with original column keys.
 */
export function exportToCSV(
  rows: Record<string, string | number>[],
  filename: string
) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","), // header row (original keys)
    ...rows.map(row =>
      headers.map(h => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV with human-readable header names.
 * Keeps original keys in the data, just changes header display.
 */
export function exportToCSVWithLabels(
  rows: Record<string, string | number>[],
  filename: string
) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const readableHeaders = headers.map(h => getFeatureLabel(h));

  const csvContent = [
    readableHeaders.join(","), // human-readable header row
    ...rows.map(row =>
      headers.map(h => JSON.stringify(row[h] ?? "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Export a mapping dictionary (MEPS code → human label) as CSV.
 */
export function exportFeatureDictionary(
  codes: string[],
  filename: string = "feature_dictionary.csv"
) {
  const csvContent = [
    "MEPS_Code,Human_Label",
    ...codes.map(code => `${code},${getFeatureLabel(code)}`)
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}