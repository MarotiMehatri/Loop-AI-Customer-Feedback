declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "test" | "production";
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      FRONTEND_URL: string;
      GEMINI_API_KEY: string;
      GEMINI_MODEL: string;
      GEMINI_EMBEDDING_MODEL: string;
    }
  }
}

export {};
