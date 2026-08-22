import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";

import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";

import { apiRouter } from "./routes/index.js";

const app = express();

export { app };

app.disable("x-powered-by");

/**
 * ---------------------------------------------------------
 * SECURITY
 * ---------------------------------------------------------
 */

app.use(helmet());

/**
 * ---------------------------------------------------------
 * CORS
 * ---------------------------------------------------------
 */

app.use(cors(corsOptions));

/**
 * ---------------------------------------------------------
 * BODY PARSERS
 * ---------------------------------------------------------
 */

app.use(
  express.json({
    limit: "2mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  }),
);

/**
 * ---------------------------------------------------------
 * LOGGER
 * ---------------------------------------------------------
 */

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/**
 * ---------------------------------------------------------
 * ROOT
 * ---------------------------------------------------------
 */

app.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LOOP AI Backend is running successfully",
    version: "1.0.0",
    environment: env.NODE_ENV,
    healthCheck: "/health",
    apiBaseUrl: "/api/v1",
  });
});

/**
 * ---------------------------------------------------------
 * HEALTH CHECK
 * ---------------------------------------------------------
 */

app.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LOOP backend is healthy",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * ---------------------------------------------------------
 * API ROUTES
 * ---------------------------------------------------------
 */

app.use("/api/v1", apiRouter);

/**
 * ---------------------------------------------------------
 * STATIC UPLOADS
 * ---------------------------------------------------------
 */

app.use(
  "/uploads",
  express.static(
    path.resolve(process.cwd(), "uploads"),
  ),
);

/**
 * ---------------------------------------------------------
 * 404
 * ---------------------------------------------------------
 */

app.use(notFoundMiddleware);

/**
 * ---------------------------------------------------------
 * ERROR HANDLER
 * ---------------------------------------------------------
 */

app.use(errorMiddleware);

export default app;