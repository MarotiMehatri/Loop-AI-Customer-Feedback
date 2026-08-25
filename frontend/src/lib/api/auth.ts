import { env } from "../../config/env";

import type {
  ApiEnvelope,
  AuthUser,
  LoginPayload,
  LoginResponse,
} from "../../types/auth.types";

type LoginData = {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
};

type LoginApiResponse = ApiEnvelope<AuthUser> & {
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  data?: LoginData;
};

function extractLoginResponse(payload: unknown): LoginResponse {
  if (!payload || typeof payload !== "object") {
    throw new Error("The server returned an invalid login response.");
  }

  const body = payload as LoginApiResponse;

  const source: LoginData =
    body.data && typeof body.data === "object"
      ? body.data
      : body;

  const accessToken = source.accessToken;
  const refreshToken = source.refreshToken;
  const user = source.user ?? body.user;

  if (!accessToken) {
    throw new Error(
      body.message || "The server did not return an access token.",
    );
  }

  if (!user) {
    throw new Error(
      body.message || "The server did not return user information.",
    );
  }

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export async function loginUser(
  payload: LoginPayload,
): Promise<LoginResponse> {
  const response = await fetch(`${env.apiUrl}/auth/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },

    // Required only if your backend uses cookies/session credentials.
    credentials: "include",

    body: JSON.stringify(payload),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = `Login failed with status ${response.status}.`;

    if (data && typeof data === "object") {
      const body = data as Partial<ApiEnvelope<unknown>>;

      if (typeof body.message === "string" && body.message.trim()) {
        message = body.message;
      }
    }

    if (response.status === 400) {
      message = message || "Invalid login request.";
    }

    if (response.status === 401) {
      message = "Invalid email or password.";
    }

    if (response.status === 403) {
      message = "You are not authorized to access this account.";
    }

    if (response.status >= 500) {
      message = "Server error. Please try again later.";
    }

    throw new Error(message);
  }

  return extractLoginResponse(data);
}