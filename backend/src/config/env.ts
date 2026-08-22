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

  FRONTEND_URL: z
    .string()
    .default("http://localhost:3000,https://loop-ai-platform.vercel.app")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url()).min(1, "At least one FRONTEND_URL is required")),

  GEMINI_API_KEY: z
    .string()
    .trim()
    .min(1, "AIzaSyDUYM3uRRBxzeYnKm3o_I5yDNeBp0MqtfE"),

  GEMINI_MODEL: z
    .string()
    .trim()
    .default("gemini-2.5-flash"),

  GEMINI_EMBEDDING_MODEL: z.string().trim().default("gemini-embedding-001"),

  SENDGRID_API_KEY: z.string().trim().default(""),
  MAIL_FROM: z.string().email().default("noreply@loop-platform.com"),
  MAIL_FROM_NAME: z.string().trim().default("LOOP AI Platform"),

  SMTP_HOST: z.string().trim().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_USER: z.string().trim().default(""),
  SMTP_PASS: z.string().trim().default(""),
  SMTP_SECURE: z
    .string()
    .default("true")
    .transform((value) => value.toLowerCase() !== "false"),
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
