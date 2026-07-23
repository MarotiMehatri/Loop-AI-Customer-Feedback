import * as insightService from "../services/insight.service.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const insightController = {
  getTopCouriers: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };
    const result = await insightService.getTopCouriers(workspaceId, startDate, endDate, Number(limit) || 10);
    success(res, "Top couriers fetched", result);
  }),

  getWorstPerforming: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };
    const result = await insightService.getWorstPerforming(workspaceId, startDate, endDate, Number(limit) || 10);
    success(res, "Worst performing fetched", result);
  }),

  getFrequentDelays: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await insightService.getFrequentDelays(workspaceId, startDate, endDate);
    success(res, "Frequent delays fetched", result);
  }),

  getRegionAnalysis: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await insightService.getRegionAnalysis(workspaceId, startDate, endDate);
    success(res, "Region analysis fetched", result);
  }),

  getCustomerAnalysis: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, customerId } = req.query as {
      startDate?: string;
      endDate?: string;
      customerId?: string;
    };
    const result = await insightService.getCustomerAnalysis(workspaceId, startDate, endDate, customerId);
    success(res, "Customer analysis fetched", result);
  }),

  getRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { category } = req.query as { category?: string };
    const result = await insightService.getRecommendations(workspaceId, category);
    success(res, "Recommendations fetched", result);
  }),
};
