import { env } from "./env.js";

export interface RateLimitPreset {
  windowMs: number;
  max: number;
}

const isProduction = env.NODE_ENV === "production";

export const rateLimitPresets = {
  /** General API routes — generous limits for normal usage. */
  default: {
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 100 : 500,
  } satisfies RateLimitPreset,

  /** Authentication endpoints — stricter to slow down brute-force. */
  auth: {
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 10 : 50,
  } satisfies RateLimitPreset,

  /** Password reset / sensitive actions. */
  sensitive: {
    windowMs: 60 * 60 * 1000,
    max: isProduction ? 5 : 20,
  } satisfies RateLimitPreset,

  /** AI / Gemini endpoints — more restrictive due to cost. */
  ai: {
    windowMs: 60 * 1000,
    max: isProduction ? 10 : 30,
  } satisfies RateLimitPreset,

  /** File upload endpoints. */
  upload: {
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 20 : 100,
  } satisfies RateLimitPreset,
} as const;
