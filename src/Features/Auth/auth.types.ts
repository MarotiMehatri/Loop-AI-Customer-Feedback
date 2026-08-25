export type { AuthRole as Role, AuthUser, LoginPayload, LoginResponse } from "../../types/auth.types";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export interface RegisterResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: import("../../types/auth.types").AuthUser;
  data?: unknown;
}
