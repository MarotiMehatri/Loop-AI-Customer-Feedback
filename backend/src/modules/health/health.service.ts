import { prisma } from "../../config/prisma.js";

export const checkDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "connected" as const };
  } catch (error) {
    return {
      status: "disconnected" as const,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getUptime = () => {
  return {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memoryUsage: process.memoryUsage(),
  };
};
