export function generateCSV(data: Record<string, unknown>[], _columns?: { key: string; label: string }[]): string {
  if (data.length === 0) return "";
  const keys = Object.keys(data[0]);
  const header = keys.map((k) => `"${k}"`).join(",");
  const rows = data.map((row) =>
    keys.map((k) => {
      const val = row[k];
      const str = val === null || val === undefined ? "" : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(","),
  );
  return [header, ...rows].join("\n");
}
