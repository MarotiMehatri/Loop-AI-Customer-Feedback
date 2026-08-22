import type { Server } from "node:http";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

let server: Server | null = null;
let isShuttingDown = false;

const BASE_URL =
  env.NODE_ENV === "production"
    ? "production"
    : `http://localhost:${env.PORT}`;

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();

    server = app.listen(env.PORT, () => {
      console.log(`LOOP backend running at ${BASE_URL}`);
    });
  } catch (error) {
    console.error("Failed to start LOOP backend:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
}

async function closeHttpServer(): Promise<void> {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    server?.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  server = null;
}

async function shutdown(
  signal: string,
  exitCode = 0,
): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down...`);

  try {
    await closeHttpServer();
    await prisma.$disconnect();

    console.log("✅ Server stopped successfully");

    process.exit(exitCode);
  } catch (error) {
    console.error("Error during shutdown:", error);

    process.exit(1);
  }
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.once("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled promise rejection:", reason);

  void shutdown("UNHANDLED_REJECTION", 1);
});

process.once("uncaughtException", (error: Error) => {
  console.error("Uncaught exception:", error);

  void shutdown("UNCAUGHT_EXCEPTION", 1);
});

void startServer();