import type { CorsOptions } from "cors";

import { env } from "./env.js";

/**
 * FRONTEND_URL can contain one or multiple comma-separated origins.
 *
 * Example:
 * FRONTEND_URL=http://localhost:3000,https://loop-ai-platform.vercel.app
 */
const allowedOrigins = new Set(
  env.FRONTEND_URL.map((origin) => origin.replace(/\/$/, "")),
);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    /**
     * Requests without an Origin header can come from:
     * - curl
     * - Postman
     * - server-to-server requests
     * - health checks
     */
    if (!origin) {
      callback(null, true);
      return;
    }

    /**
     * Development
     *
     * Allow local frontend development.
     */
    if (env.NODE_ENV === "development") {
      const isLocalhost =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.");

      if (isLocalhost) {
        callback(null, true);
        return;
      }
    }

    /**
     * Production / explicitly allowed frontend origins.
     */
    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    /**
     * Reject unknown origins.
     */
    console.error(`CORS blocked request from origin: ${origin}`);

     callback(
      new Error(`CORS blocked origin: ${origin}`),
      false);
  },

  /**
   * Required when using cookies / authentication credentials.
   */
  credentials: true,

  /**
   * Allowed HTTP methods.
   */
  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  /**
   * Allowed request headers.
   */
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],

  /**
   * Successful OPTIONS preflight response.
   */
  optionsSuccessStatus: 204,
};