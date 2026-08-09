declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: "ADMIN" | "ANALYST" | "VIEWER";
      workspaceId: string;
    }

    interface Request {
      user?: User;
      workspaceId?: string;
    }
  }
}

export {};
