export function getStartDate(period?: string): Date | undefined {
  if (!period) return undefined;
  const d = new Date(period);
  if (isNaN(d.getTime())) return undefined;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndDate(period?: string): Date | undefined {
  if (!period) return undefined;
  const d = new Date(period);
  if (isNaN(d.getTime())) return undefined;
  d.setHours(23, 59, 59, 999);
  return d;
}
