export function normalizeWorkspaceName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
