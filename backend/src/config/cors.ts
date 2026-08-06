import type { CorsOptions } from "cors";

import { env } from "./env.js";

const allowedOrigins = env.FRONTEND_URL;

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    /*
     * Requests from Postman, curl and server-to-server
     * clients may not contain an Origin header.
     */
    if (!origin) {
      callback(null, true);
      return;
    }

    /*
     * During development the frontend may run from any local
     * URL (localhost, 127.0.0.1 or a LAN IP), so allow all origins.
     */
    if (env.NODE_ENV === "development" || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked request from origin: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};


