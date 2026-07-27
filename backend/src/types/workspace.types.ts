import type { Role } from "../generated/prisma/client.js";

export interface WorkspaceContext {
  workspaceId: string;
  userId: string;
  role: Role;
}

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
}
