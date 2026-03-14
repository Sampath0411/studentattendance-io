/**
 * Secure Excel/CSV utilities — replaces vulnerable `xlsx` package.
 * Export: generates proper CSV with BOM for Excel compatibility.
 * Import: parses CSV files (users can save .xlsx as .csv from Excel).
 */

import { stripHtml } from "@/lib/sanitize";

// ── Export ──────────────────────────────────────────────────────────

function escapeCSVCell(value: string): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCSV(
  rows: Record<string, string | number | null | undefined>[],
  filename: string
) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.map(escapeCSVCell).join(","),
    ...rows.map((row) =>
      headers.map((h) => escapeCSVCell(String(row[h] ?? ""))).join(",")
    ),
  ];

  // BOM for Excel to detect UTF-8
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvLines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Import (CSV parsing) ───────────────────────────────────────────

function parseCSVLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCSV(text: string): Record<string, string>[] {
  // Remove BOM if present
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => sanitizeInput(h));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = sanitizeInput(cells[idx] ?? "");
    });
    rows.push(row);
  }

  return rows;
}

export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
