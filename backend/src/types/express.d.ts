declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: "ADMIN" | "ANALYST" | "VIEWER";
      workspaceId: string;
    };
    workspaceId?: string;
  }
}

export {};
