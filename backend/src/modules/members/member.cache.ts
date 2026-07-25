interface MemberCacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 2 * 60 * 1000;

class MemberCache {
  private readonly entries = new Map<string, MemberCacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key: string): void {
    this.entries.delete(key);
  }

  clearWorkspace(workspaceId: string): void {
    for (const key of this.entries.keys()) {
      if (key.includes(workspaceId)) {
        this.entries.delete(key);
      }
    }
  }

  clear(): void {
    this.entries.clear();
  }
}

export const memberCache = new MemberCache();
