import { prisma } from "../../config/prisma.js";

import type {
  ComponentHealth,
  HealthStatus,
} from "./workspace.types.js";

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return {
      status: latencyMs > 1000 ? "degraded" : "healthy",
      latencyMs,
      message: latencyMs > 1000 ? "Database response is slow" : undefined,
    };
  } catch {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      message: "Database connection failed",
    };
  }
}

const startTime = Date.now();

export const workspaceHealthService = {
  async getHealth(): Promise<HealthStatus> {
    const db = await checkDatabase();

    const status: HealthStatus["status"] =
      db.status === "unhealthy"
        ? "unhealthy"
        : db.status === "degraded"
          ? "degraded"
          : "healthy";

    return {
      status,
      database: db,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      lastChecked: new Date(),
    };
  },
};
