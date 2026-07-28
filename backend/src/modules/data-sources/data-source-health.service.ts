import type { HealthCheckResult } from "./data-source.types.js";

export const dataSourceHealthService = {
  async check(dataSourceId: string): Promise<HealthCheckResult> {
    const latencyMs = Math.floor(Math.random() * 200);

    return {
      dataSourceId,
      status: latencyMs < 100 ? "healthy" : "degraded",
      latencyMs,
      lastCheckedAt: new Date(),
    };
  },
};
