export type AuthRole = "ADMIN" | "ANALYST" | "VIEWER";
export type LoginRole = AuthRole;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: AuthRole;
  workspaceId?: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}
