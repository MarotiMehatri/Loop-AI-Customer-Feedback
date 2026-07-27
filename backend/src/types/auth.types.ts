import type { Role } from "../generated/prisma/client.js";

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  workspaceId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}
