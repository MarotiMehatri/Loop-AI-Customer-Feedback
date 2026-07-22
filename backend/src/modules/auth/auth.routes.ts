import { Router } from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  loginController,
  logoutController,
  profileController,
  registerController,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", asyncHandler(registerController));

authRouter.post("/login", asyncHandler(loginController));

authRouter.get("/profile", authenticate, asyncHandler(profileController));

authRouter.post("/logout", authenticate, asyncHandler(logoutController));
