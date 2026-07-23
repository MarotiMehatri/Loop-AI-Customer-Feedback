declare global {
  namespace Express {
    interface Request {
      userId?: string;
      workspaceId?: string;
      role?: string;
    }
  }
}
export {};
