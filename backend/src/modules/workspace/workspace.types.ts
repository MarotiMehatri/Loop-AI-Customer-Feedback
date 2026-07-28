import type { Role } from "../../generated/prisma/client.js";

export interface WorkspaceContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface UpdateWorkspaceInput {
  name: string;
}

export interface DeleteWorkspaceInput {
  confirmation: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  createdAt: Date;
}

export interface WorkspaceSummary {
  members: number;
  activeMembers: number;
  feedback: number;
  themes: number;
  reports: number;
}
