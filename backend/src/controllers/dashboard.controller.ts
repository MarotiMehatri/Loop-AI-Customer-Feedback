import * as dashboardService from "../services/dashboard.service.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { getWorkspaceId } from "../utils/requestContext.js";

export const dashboardController = {
  getOverview: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await dashboardService.getOverview(workspaceId, startDate, endDate);
    success(res, "Dashboard overview fetched", result);
  }),

  getShipmentSummary: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await dashboardService.getShipmentSummary(workspaceId, startDate, endDate);
    success(res, "Shipment summary fetched", result);
  }),

  getDeliveryPerformance: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await dashboardService.getDeliveryPerformance(workspaceId, startDate, endDate);
    success(res, "Delivery performance fetched", result);
  }),

  getCourierPerformance: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await dashboardService.getCourierPerformance(workspaceId, startDate, endDate);
    success(res, "Courier performance fetched", result);
  }),

  getFailedDeliveries: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate, page, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    };
    const result = await dashboardService.getFailedDeliveries(workspaceId, startDate, endDate, Number(page) || 1, Number(limit) || 20);
    success(res, "Failed deliveries fetched", result);
  }),

  getDelayedShipments: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate, page, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    };
    const result = await dashboardService.getDelayedShipments(workspaceId, startDate, endDate, Number(page) || 1, Number(limit) || 20);
    success(res, "Delayed shipments fetched", result);
  }),

  getMonthlyReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { month, year } = req.query as { month?: string; year?: string };
    const result = await dashboardService.getMonthlyReport(workspaceId, Number(month), Number(year));
    success(res, "Monthly report fetched", result);
  }),

  getKPIs: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const result = await dashboardService.getKPIs(workspaceId, startDate, endDate);
    success(res, "KPIs fetched", result);
  }),
};
