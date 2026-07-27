import { env } from "./env.js";

export interface SwaggerOptions {
  title: string;
  description: string;
  version: string;
  baseUrl: string;
}

export const swaggerConfig: SwaggerOptions = {
  title: "LOOP AI Customer Feedback API",
  description:
    "API for managing customer feedback with AI-powered classification, sentiment analysis, and insight generation.",
  version: "1.0.0",
  baseUrl:
    env.NODE_ENV === "production"
      ? "https://api.loop-ai.example.com"
      : `http://localhost:${env.PORT}`,
};

export const swaggerUiOptions = {
  customSiteTitle: `${swaggerConfig.title} — Docs`,
  customCss: ".swagger-ui .topbar { display: none }",
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "list" as const,
    filter: true,
  },
};
