import * as feedbackService from "../services/feedback.service.js";
import { ApiError } from "../utils/apiError.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const feedbackController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const result = await feedbackService.listFeedback(workspaceId, req.query as Record<string, unknown>);
    success(res, "Feedback fetched", result);
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    const result = await feedbackService.getFeedback(id, workspaceId);
    success(res, "Feedback fetched", result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const result = await feedbackService.createFeedback(workspaceId, req.body);
    success(res, "Feedback created", result, 201);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    const result = await feedbackService.updateFeedback(id, workspaceId, req.body);
    success(res, "Feedback updated", result);
  }),

  changeStatus: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status) throw new ApiError(400, "Status is required");
    await feedbackService.changeStatus(id, workspaceId, status);
    success(res, "Feedback status updated");
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const id = req.params.id as string;
    await feedbackService.deleteFeedback(id, workspaceId);
    success(res, "Feedback deleted");
  }),

  import: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, "Items array is required");
    }
    const result = await feedbackService.importFeedback(workspaceId, items);
    success(res, "Feedback imported", result, 201);
  }),

  stats: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const result = await feedbackService.getFeedbackStats(workspaceId);
    success(res, "Feedback stats fetched", result);
  }),

  search: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { q, page, limit } = req.query as { q?: string; page?: string; limit?: string };
    if (!q) throw new ApiError(400, "Search query is required");
    const result = await feedbackService.searchFeedback(workspaceId, q, Number(page) || 1, Number(limit) || 20);
    success(res, "Search results fetched", result);
  }),
};
