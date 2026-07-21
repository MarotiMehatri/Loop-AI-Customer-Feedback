import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import routes from "./routes/index.js";

import { errorHandler } from "./middleware/error.middleware.js";

import { notFound } from "./middleware/notFound.middleware.js";

export const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "LOOP backend server is running",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1", routes);

app.use(notFound);

app.use(errorHandler);
