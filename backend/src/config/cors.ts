import type { CorsOptions } from "cors";

import { env } from "./env.js";

const allowedOrigins = new Set(env.FRONTEND_URL);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Requests such as curl/Postman may have no Origin.
    if (!origin) {
      callback(null, true);
      return;
    }

    // Development: allow local development origins.
    if (
      env.NODE_ENV === "development" &&
      (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.startsWith("http://192.168.")
      )
    ) {
      callback(null, true);
      return;
    }

    // Production / explicitly allowed frontend.
    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    console.error(`CORS blocked request from origin: ${origin}`);

    callback(null, false);
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
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],

  optionsSuccessStatus: 204,
};