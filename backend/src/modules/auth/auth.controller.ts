import type {
  Request,
  Response,
} from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "./auth.service.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validator.js";

/**
 * POST /api/v1/auth/register
 */
export const registerController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validatedData =
    registerSchema.parse(
      request.body,
    );

  const result =
    await registerUser(
      validatedData,
    );

  response.status(201).json({
    success: true,
    ...result,
  });
};

/**
 * POST /api/v1/auth/login
 */
export const loginController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validatedData =
    loginSchema.parse(
      request.body,
    );

  const result =
    await loginUser(
      validatedData,
    );

  response.status(200).json({
    success: true,
    ...result,
  });
};

/**
 * GET /api/v1/auth/profile
 */
export const profileController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.user) {
    throw new ApiError(
      401,
      "Authentication required",
    );
  }

  const user =
    await getCurrentUser(
      request.user.userId,
    );

  response.status(200).json({
    success: true,
    message:
      "Profile retrieved successfully",
    data: {
      user,
    },
  });
};

/**
 * POST /api/v1/auth/logout
 */
export const logoutController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  response.status(200).json({
    success: true,
    message: "Logout successful",
  });
};