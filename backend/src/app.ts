// import cors from "cors";
// import express from "express";
// import helmet from "helmet";
// import morgan from "morgan";
// import path from "node:path";

// import { corsOptions } from "./config/cors.js";
// import { env } from "./config/env.js";

// import { errorMiddleware } from "./middleware/error.middleware.js";
// import { notFoundMiddleware } from "./middleware/notFound.middleware.js";

// import { apiRouter } from "./routes/index.js";

// export const app = express();

// app.disable("x-powered-by");

// /*
//  * CORS MUST BE REGISTERED BEFORE API ROUTES.
//  */
// app.use(cors(corsOptions));

// /*
//  * Explicitly handle browser preflight requests.
//  */
// // app.options("*", cors(corsOptions));

// /*
//  * Security headers.
//  */
// app.use(helmet());

// /*
//  * Request body parsing.
//  */
// app.use(
//   express.json({
//     limit: "2mb",
//   }),
// );

// app.use(
//   express.urlencoded({
//     extended: true,
//     limit: "2mb",
//   }),
// );

// /*
//  * Development logging.
//  */
// if (env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// /*
//  * Root route.
//  */
// app.get("/", (_request, response) => {
//   response.status(200).json({
//     success: true,
//     message: "LOOP AI Backend is running successfully",
//     version: "1.0.0",
//     environment: env.NODE_ENV,
//     healthCheck: "/health",
//     apiBaseUrl: "/api/v1",
//   });
// });

// /*
//  * Health route.
//  */
// app.get("/health", (_request, response) => {
//   response.status(200).json({
//     success: true,
//     message: "LOOP backend is healthy",
//     environment: env.NODE_ENV,
//     timestamp: new Date().toISOString(),
//   });
// });

// /*
//  * API routes.
//  */
// app.use("/api/v1", apiRouter);

// /*
//  * Uploaded files.
//  */
// app.use(
//   "/uploads",
//   express.static(
//     path.resolve(process.cwd(), "uploads"),
//   ),
// );

// /*
//  * 404 middleware.
//  */
// app.use(notFoundMiddleware);

// /*
//  * Error middleware MUST remain last.
//  */
// app.use(errorMiddleware);

// export default app;

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
//export default app;

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
 *
 * IMPORTANT:
 * Do NOT use:
 *
 * app.options("*", cors(corsOptions))
 *
 * Express 5 / path-to-regexp can throw:
 * PathError: Missing parameter name at index 1: *
 *
 * cors middleware handles preflight requests when mounted
 * globally.
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
 * ROOT ROUTE
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
  express.static(path.resolve(process.cwd(), "uploads")),
);

/**
 * ---------------------------------------------------------
 * 404 HANDLER
 * ---------------------------------------------------------
 *
 * This must come AFTER all valid routes.
 */
app.use(notFoundMiddleware);

/**
 * ---------------------------------------------------------
 * ERROR HANDLER
 * ---------------------------------------------------------
 *
 * This must always be the LAST middleware.
 */
app.use(errorMiddleware);

export default app;