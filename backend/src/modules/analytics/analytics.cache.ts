import { ANALYTICS_CACHE_TTL_MS } from "./analytics.constants.js";
import type { AnalyticsCacheEntry } from "./analytics.types.js";

const cache = new Map<string, AnalyticsCacheEntry<unknown>>();

export function getCachedAnalytics<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCachedAnalytics<T>(
  key: string,
  value: T,
  ttlMs = ANALYTICS_CACHE_TTL_MS,
): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function clearAnalyticsCache(workspaceId?: string): void {
  if (!workspaceId) return cache.clear();
  for (const key of cache.keys())
    if (key.includes(`workspace:${workspaceId}`)) cache.delete(key);
}

export function createAnalyticsCacheKey(
  workspaceId: string,
  endpoint: string,
  query: unknown,
): string {
  return `workspace:${workspaceId}:analytics:${endpoint}:${JSON.stringify(query)}`;
}
