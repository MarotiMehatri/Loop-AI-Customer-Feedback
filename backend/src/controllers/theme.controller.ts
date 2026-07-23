import * as themeService from "../services/theme.service.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const themeController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const query = req.query as any;
    const result = await themeService.listThemes(workspaceId, query);
    success(res, "Themes fetched", result);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    const result = await themeService.getTheme(id, workspaceId);
    success(res, "Theme fetched", result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const result = await themeService.createTheme(workspaceId, req.body);
    success(res, "Theme created", result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    const result = await themeService.updateTheme(id, workspaceId, req.body);
    success(res, "Theme updated", result);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    await themeService.deleteTheme(id, workspaceId);
    success(res, "Theme deleted");
  }),

  stats: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const result = await themeService.getThemeStats(workspaceId);
    success(res, "Theme stats fetched", result);
  }),
};
