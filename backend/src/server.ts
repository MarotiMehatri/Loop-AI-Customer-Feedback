import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

/**
 * Detect whether the application is running on Vercel.
 */
const isVercel = Boolean(process.env.VERCEL);

/**
 * ---------------------------------------------------------
 * VERCEL SERVERLESS HANDLER
 * ---------------------------------------------------------
 *
 * Vercel handles the HTTP server automatically.
 *
 * Therefore:
 * - Do NOT call app.listen() on Vercel.
 * - Export the Express application.
 */
if (isVercel) {
  void prisma.$connect().catch((error: unknown) => {
    console.error(
      "Failed to connect to PostgreSQL on Vercel:",
      error,
    );
  });
}

/**
 * ---------------------------------------------------------
 * LOCAL DEVELOPMENT SERVER
 * ---------------------------------------------------------
 *
 * When running locally:
 *
 * npm run dev
 *
 * the Express server listens on PORT.
 */
if (!isVercel) {
  const startServer = async (): Promise<void> => {
    try {
      await prisma.$connect();

      const server = app.listen(env.PORT, () => {
        console.log(
          `LOOP AI Backend running at http://localhost:${env.PORT}`,
        );
      });

      /**
       * -----------------------------------------------------
       * GRACEFUL SHUTDOWN
       * -----------------------------------------------------
       */
      let isShuttingDown = false;

      const shutdown = async (
        signal: string,
        exitCode = 0,
      ): Promise<void> => {
        if (isShuttingDown) {
          return;
        }

        isShuttingDown = true;

        console.log(
          `\n${signal} received. Shutting down...`,
        );

        try {
          await new Promise<void>((resolve, reject) => {
            server.close((error) => {
              if (error) {
                reject(error);
                return;
              }

              resolve();
            });
          });

          await prisma.$disconnect();

          console.log(
            "Server stopped successfully",
          );

          process.exit(exitCode);
        } catch (error) {
          console.error(
            "Error during shutdown:",
            error,
          );

          process.exit(1);
        }
      };

      /**
       * -----------------------------------------------------
       * PROCESS SIGNALS
       * -----------------------------------------------------
       */
      process.once("SIGINT", () => {
        void shutdown("SIGINT");
      });

      process.once("SIGTERM", () => {
        void shutdown("SIGTERM");
      });

      /**
       * -----------------------------------------------------
       * UNHANDLED PROMISE REJECTION
       * -----------------------------------------------------
       */
      process.once(
        "unhandledRejection",
        (reason: unknown) => {
          console.error(
            "Unhandled promise rejection:",
            reason,
          );

          void shutdown(
            "UNHANDLED_REJECTION",
            1,
          );
        },
      );

      /**
       * -----------------------------------------------------
       * UNCAUGHT EXCEPTION
       * -----------------------------------------------------
       */
      process.once(
        "uncaughtException",
        (error: Error) => {
          console.error(
            "Uncaught exception:",
            error,
          );

          void shutdown(
            "UNCAUGHT_EXCEPTION",
            1,
          );
        },
      );
    } catch (error) {
      console.error(
        "Failed to start LOOP AI Backend:",
        error,
      );

      await prisma.$disconnect();

      process.exit(1);
    }
  };

  void startServer();
}

/**
 * ---------------------------------------------------------
 * EXPORT EXPRESS APPLICATION
 * ---------------------------------------------------------
 *
 * Required by Vercel.
 */
export { app };

export default app;