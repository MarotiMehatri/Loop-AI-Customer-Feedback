export interface DataSourceLogEntry {
  dataSourceId: string;
  level: "info" | "warn" | "error";
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const logs: DataSourceLogEntry[] = [];

export const dataSourceLogService = {
  log(entry: Omit<DataSourceLogEntry, "timestamp">): void {
    logs.push({ ...entry, timestamp: new Date() });

    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
  },

  getRecent(dataSourceId: string, limit = 50): DataSourceLogEntry[] {
    return logs
      .filter((entry) => entry.dataSourceId === dataSourceId)
      .slice(-limit);
  },

  clear(dataSourceId?: string): void {
    if (dataSourceId) {
      const ids = new Set(
        logs.map((e, i) => (e.dataSourceId === dataSourceId ? i : -1)),
      );
      const toRemove = [...ids].filter((i) => i >= 0).sort((a, b) => b - a);
      for (const i of toRemove) {
        logs.splice(i, 1);
      }
    } else {
      logs.length = 0;
    }
  },
};
