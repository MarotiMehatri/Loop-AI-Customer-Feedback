import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z
    .string()
    .min(
      1,
      "postgresql://postgres:Loop@123@localhost:5432/loop_db?schema=public",
    ),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must contain at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("7d"),

  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  GEMINI_API_KEY: z
    .string()
    .trim()
    .min(1, "AIzaSyDUYM3uRRBxzeYnKm3o_I5yDNeBp0MqtfE"),

  GEMINI_MODEL: z
    .string()
    .trim()
    .min(1, "genibi-1.5-flash")
    .default("gemini-2.5-flash"),

  GEMINI_EMBEDDING_MODEL: z.string().trim().default("gemini-embedding-001"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Environment validation failed:",
    parsedEnv.error.flatten().fieldErrors,
  );

  process.exit(1);
}

export const env = parsedEnv.data;
