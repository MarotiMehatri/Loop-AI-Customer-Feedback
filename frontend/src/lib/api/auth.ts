
import { apiClient } from "./api-client";

import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
} from "../../types/auth.types";

export async function loginUser(
  payload: LoginRequest,
): Promise<LoginResponse> {
  const response =
    await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );

  return response.data;
}

export async function signupUser(
  payload: SignupRequest,
): Promise<SignupResponse> {
  const response =
    await apiClient.post<SignupResponse>(
      "/auth/register",
      payload,
    );

  return response.data;
}