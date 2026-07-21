import type { Server } from "node:http";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

let server: Server | undefined;

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL database connected successfully");

    server = app.listen(env.PORT, () => {
      console.log(`🚀 LOOP backend running at http://localhost:${env.PORT}`);

      console.log(`❤️ Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start LOOP backend:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down...`);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();

      console.log("✅ Server and database connection closed");

      process.exit(0);
    });

    return;
  }

  await prisma.$disconnect();

  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("❌ Unhandled promise rejection:", reason);

  void shutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (error: Error) => {
  console.error("❌ Uncaught exception:", error);

  void shutdown("UNCAUGHT_EXCEPTION");
});

void startServer();
