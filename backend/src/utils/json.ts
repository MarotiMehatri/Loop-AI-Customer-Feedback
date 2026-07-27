export function safeJsonParse<T = unknown>(
  value: string,
  fallback: T,
): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function deepClone<T>(value: T): T {
  return structuredClone(value);
}
