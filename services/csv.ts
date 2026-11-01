/** Serialises rows to CSV with a UTF-8 BOM so Excel reads Greek text correctly. */
export function toCsv(rows: (string | number | null)[][]): string {
  const escape = (v: string | number | null) => {
    const text = v === null ? '' : String(v);
    // Prefix formula-trigger chars to prevent CSV injection in Excel/Sheets
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return '﻿' + rows.map((r) => r.map(escape).join(',')).join('\n');
}
