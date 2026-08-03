export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  workspaceId: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  accessToken: string;
  user: AuthUser;
}
