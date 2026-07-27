import type { HelmetOptions } from "helmet";

import { env } from "./env.js";

export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },

  crossOriginEmbedderPolicy: env.NODE_ENV === "production",

  crossOriginOpenerPolicy: true,

  crossOriginResourcePolicy: { policy: "same-site" },

  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  hsts:
    env.NODE_ENV === "production"
      ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
      : false,

  noSniff: true,

  xssFilter: true,

  hidePoweredBy: true,
};
