import { DASHBOARD_CACHE_TTL_MS } from "./dashboard.constants.js";

import type { DashboardResponse } from "./dashboard.types.js";

interface DashboardCacheEntry {
  value: DashboardResponse;
  expiresAt: number;
}

const store = new Map<string, DashboardCacheEntry>();

function createKey(
  workspaceId: string,
  startDate: Date,
  endDate: Date,
  recentLimit: number,
  topThemesLimit: number,
): string {
  return [
    "admin-dashboard",
    workspaceId,
    startDate.toISOString(),
    endDate.toISOString(),
    recentLimit,
    topThemesLimit,
  ].join(":");
}

function get(key: string): DashboardResponse | null {
  const entry = store.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

function set(
  key: string,
  value: DashboardResponse,
  ttlMs = DASHBOARD_CACHE_TTL_MS,
): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

function deleteWorkspace(workspaceId: string): void {
  const prefix = `admin-dashboard:${workspaceId}:`;

  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

function clear(): void {
  store.clear();
}

export const dashboardCache = {
  createKey,
  get,
  set,
  deleteWorkspace,
  clear,
};
