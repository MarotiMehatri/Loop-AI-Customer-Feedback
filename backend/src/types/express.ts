import type { Role } from "../generated/prisma/client.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: Role;
      workspaceId: string;
    };

    workspaceId?: string;
  }
}

export {};