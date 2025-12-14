// src/lib/exportCsv.ts

export function exportToCSV(
  rows: Record<string, string | number>[],
  filename: string
) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","), // header row
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