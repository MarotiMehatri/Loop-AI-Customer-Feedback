import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";

import {
  requestPasswordReset,
  resetPassword,
  changePassword,
} from "./password-reset.service.js";

import {
  requestEmailVerification,
  verifyEmail,
  resendVerification,
} from "./email-verification.service.js";

import type { AuthenticatedRequest } from "./auth.types.js";

import { loginSchema, registerSchema } from "./auth.validator.js";

export const registerController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validatedData = registerSchema.parse(request.body);

  const result = await registerUser(validatedData);

  response.status(201).json({
    success: true,
    ...result,
  });
};

export const loginController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validatedData = loginSchema.parse(request.body);

  const result = await loginUser(validatedData);

  response.status(200).json({
    success: true,
    ...result,
  });
};

export const profileController = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await getCurrentUser(request.user.userId);

  response.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      user,
    },
  });
};

export const logoutController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

export const requestPasswordResetController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { email } = request.body as { email: string };

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const result = await requestPasswordReset(email);

  response.status(200).json({
    success: true,
    ...result,
  });
};

export const resetPasswordController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { token, password } = request.body as { token: string; password: string };

  if (!token || !password) {
    throw new ApiError(400, "Token and password are required");
  }

  const result = await resetPassword(token, password);

  response.status(200).json({
    success: true,
    ...result,
  });
};

export const changePasswordController = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    throw new ApiError(401, "Authentication required");
  }

  const { currentPassword, newPassword } = request.body as {
    currentPassword: string;
    newPassword: string;
  };

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Current password and new password are required");
  }

  const result = await changePassword(request.user.userId, currentPassword, newPassword);

  response.status(200).json({
    success: true,
    ...result,
  });
};

export const requestEmailVerificationController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { email } = request.body as { email?: string };

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const result = await requestEmailVerification(email);

  response.status(200).json({
    success: true,
    ...result,
  });
};

export const verifyEmailController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { email, otp } = request.body as { email?: string; otp?: string };

  if (!email || !otp) {
    throw new ApiError(400, "Email and verification code are required");
  }

  const result = await verifyEmail(email, otp);

  response.status(200).json({
    success: true,
    ...result,
  });
};

export const resendVerificationController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const { email } = request.body as { email?: string };

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const result = await resendVerification(email);

  response.status(200).json({
    success: true,
    ...result,
  });
};
