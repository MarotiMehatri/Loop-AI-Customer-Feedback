import * as analyticsService from "../services/analytics.service.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const analyticsController = {
  getShipmentAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, groupBy } = req.query as {
      startDate?: string;
      endDate?: string;
      groupBy?: string;
    };
    const result = await analyticsService.getShipmentAnalytics(workspaceId, startDate, endDate, groupBy);
    success(res, "Shipment analytics fetched", result);
  }),

  getCourierAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, courierId } = req.query as {
      startDate?: string;
      endDate?: string;
      courierId?: string;
    };
    const result = await analyticsService.getCourierAnalytics(workspaceId, startDate, endDate, courierId);
    success(res, "Courier analytics fetched", result);
  }),

  getCustomerAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, customerId } = req.query as {
      startDate?: string;
      endDate?: string;
      customerId?: string;
    };
    const result = await analyticsService.getCustomerAnalytics(workspaceId, startDate, endDate, customerId);
    success(res, "Customer analytics fetched", result);
  }),

  getDeliveryAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, status } = req.query as {
      startDate?: string;
      endDate?: string;
      status?: string;
    };
    const result = await analyticsService.getDeliveryAnalytics(workspaceId, startDate, endDate, status);
    success(res, "Delivery analytics fetched", result);
  }),

  getRevenueAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, groupBy } = req.query as {
      startDate?: string;
      endDate?: string;
      groupBy?: string;
    };
    const result = await analyticsService.getRevenueAnalytics(workspaceId, startDate, endDate, groupBy);
    success(res, "Revenue analytics fetched", result);
  }),

  getTrendData: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, metric, interval } = req.query as {
      startDate?: string;
      endDate?: string;
      metric?: string;
      interval?: string;
    };
    const result = await analyticsService.getTrendData(workspaceId, startDate, endDate, metric, interval);
    success(res, "Trend data fetched", result);
  }),

  getHeatmapData: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await analyticsService.getHeatmapData(workspaceId, startDate, endDate);
    success(res, "Heatmap data fetched", result);
  }),

  getComparisonData: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, compareBy, entities } = req.query as {
      startDate?: string;
      endDate?: string;
      compareBy?: string;
      entities?: string;
    };
    const entityList = entities ? entities.split(",") : undefined;
    const result = await analyticsService.getComparisonData(workspaceId, startDate, endDate, compareBy, entityList);
    success(res, "Comparison data fetched", result);
  }),

  getFilters: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const result = await analyticsService.getFilters(workspaceId);
    success(res, "Filters fetched", result);
  }),
};
