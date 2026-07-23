import type { Request } from "express";
import type { Role } from "../../generated/prisma/client.js";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  workspaceId: string;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  isActive: boolean;
  workspaceId: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  user: AuthenticatedUser;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
