import type { Role } from "../generated/prisma/client.js";

declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: Role;
      workspaceId: string;
    }

    interface Request {
      user?: User;
      workspaceId?: string;
    }
  }
}

export {};
