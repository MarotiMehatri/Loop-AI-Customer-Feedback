import { Router } from "express";

import {
  authenticate,
} from "../../middleware/authenticate.middleware.js";

import {
  asyncHandler,
} from "../../utils/asyncHandler.js";

import {
  loginController,
  logoutController,
  profileController,
  registerController,
} from "./auth.controller.js";

export const authRouter = Router();

/**
 * ============================================================
 * PUBLIC AUTH ROUTES
 * ============================================================
 */

/**
 * POST /api/v1/auth/register
 */
authRouter.post(
  "/register",
  asyncHandler(
    registerController,
  ),
);

/**
 * POST /api/v1/auth/login
 */
authRouter.post(
  "/login",
  asyncHandler(
    loginController,
  ),
);

/**
 * ============================================================
 * PROTECTED AUTH ROUTES
 * ============================================================
 */

/**
 * GET /api/v1/auth/profile
 *
 * Authentication:
 * Authorization: Bearer <JWT>
 */
authRouter.get(
  "/profile",
  authenticate,
  asyncHandler(
    profileController,
  ),
);

/**
 * POST /api/v1/auth/logout
 */
authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(
    logoutController,
  ),
);

export default authRouter;