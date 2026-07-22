import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { getCurrentUser, loginUser, registerUser } from "./auth.service.js";

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
  /*
   * JWT authentication is stateless.
   *
   * The frontend should remove the stored access token.
   * A token blacklist or refresh-token table can be added later.
   */

  response.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
