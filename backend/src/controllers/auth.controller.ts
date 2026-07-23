import * as authService from "../services/auth.service.js";
import { ApiError } from "../utils/apiError.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, "Email and password required");
    const result = await authService.login(email, password);
    success(res, "Login successful", result);
  }),

  register: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role, workspaceId } = req.body;
    const result = await authService.register(name, email, password, role, workspaceId);
    success(res, "Registration successful", result, 201);
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.getProfile(req.userId!);
    success(res, "Profile fetched", result);
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    success(res, "Logged out successfully");
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) throw new ApiError(400, "Old and new passwords required");
    await authService.changePassword(req.userId!, oldPassword, newPassword);
    success(res, "Password changed successfully");
  }),
};
