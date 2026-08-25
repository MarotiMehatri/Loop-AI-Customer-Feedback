import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  loginController,
  logoutController,
  profileController,
  registerController,
  requestPasswordResetController,
  resetPasswordController,
  changePasswordController,
  requestEmailVerificationController,
  verifyEmailController,
  resendVerificationController,
} from "./auth.controller.js";

export const authRouter = Router();

// Public routes
authRouter.post(
  "/register",
  asyncHandler(registerController),
);

authRouter.post(
  "/login",
  asyncHandler(loginController),
);

authRouter.post(
  "/password-reset/request",
  asyncHandler(requestPasswordResetController),
);

authRouter.post(
  "/password-reset/confirm",
  asyncHandler(resetPasswordController),
);

authRouter.post(
  "/email-verification/request",
  asyncHandler(requestEmailVerificationController),
);

authRouter.post(
  "/email-verification/confirm",
  asyncHandler(verifyEmailController),
);

authRouter.post(
  "/email-verification/resend",
  asyncHandler(resendVerificationController),
);

// Protected routes
authRouter.get(
  "/profile",
  authenticate,
  asyncHandler(profileController),
);

authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(logoutController),
);

authRouter.post(
  "/password-change",
  authenticate,
  asyncHandler(changePasswordController),
);