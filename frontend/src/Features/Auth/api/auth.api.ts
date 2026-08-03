import { apiClient } from "../../../lib/api/api-client";
import type { LoginResponse, RegisterResponse } from "../auth.types";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", input);
  return data;
}

export async function register(input: RegisterInput): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>("/auth/register", input);
  return data;
}
