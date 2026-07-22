import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { corsOptions } from "./config/cors.js";
import { env } from "./config/env.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/notFound.middleware.js";

import { apiRouter } from "./routes/index.js";

export const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors(corsOptions));

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

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/**
 * Root route
 * GET http://localhost:5000/
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
 * Health route
 * GET http://localhost:5000/health
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
 * API routes
 */
app.use("/api/v1", apiRouter);

/**
 * 404 middleware must remain after all valid routes.
 */
app.use(notFoundMiddleware);

/**
 * Error middleware must be last.
 */
app.use(errorMiddleware);
