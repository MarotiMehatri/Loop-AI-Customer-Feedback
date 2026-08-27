
export type AuthRole =
  | "ADMIN"
  | "ANALYST"
  | "VIEWER";

export type LoginRole =
  | "ADMIN"
  | "ANALYST"
  | "VIEWER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  workspaceId?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: "ANALYST" | "VIEWER";
}

export interface SignupResponse {
  user: AuthUser;
  message?: string;
}