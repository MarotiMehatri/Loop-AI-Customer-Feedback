import cors from "cors";

import { env } from "./env.js";

const allowedOrigins = new Set(
  env.FRONTEND_URL,
);

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    /**
     * Requests without Origin.
     *
     * Examples:
     * - curl
     * - server-to-server requests
     * - some health checks
     */
    if (!origin) {
      callback(null, true);
      return;
    }

    /**
     * Local development.
     */
    const isLocalhost =
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.startsWith("http://192.168.");

    if (isLocalhost) {
      callback(null, true);
      return;
    }

    /**
     * Production frontend.
     */
    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    /**
     * Unknown origin.
     */
    console.error(
      `CORS blocked request from origin: ${origin}`,
    );

    callback(
      new Error(
        `CORS blocked origin: ${origin}`,
      ),
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};