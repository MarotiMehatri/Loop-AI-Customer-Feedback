import { REPORT_CACHE_TTL_MS } from "./report.constants.js";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class ReportCache {
  private readonly values = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.values.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.values.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl = REPORT_CACHE_TTL_MS): void {
    this.values.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    });
  }

  delete(key: string): void {
    this.values.delete(key);
  }

  deleteWorkspace(workspaceId: string): void {
    for (const key of this.values.keys()) {
      if (key.includes(workspaceId)) {
        this.values.delete(key);
      }
    }
  }

  clear(): void {
    this.values.clear();
  }
}

export const reportCache = new ReportCache();
