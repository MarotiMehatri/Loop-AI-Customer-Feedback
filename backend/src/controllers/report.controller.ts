import * as reportService from "../services/report.service.js";
import { ApiError } from "../utils/apiError.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";

export const reportController = {
  generateReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { type, startDate, endDate, filters } = req.body;
    if (!type) throw new ApiError(400, "Report type is required");
    const result = await reportService.generateReport(workspaceId, type, startDate, endDate, filters);
    success(res, "Report generated successfully", result, 201);
  }),

  getShipmentReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, status, courierId } = req.query as {
      startDate?: string;
      endDate?: string;
      status?: string;
      courierId?: string;
    };
    const result = await reportService.getShipmentReport(workspaceId, startDate, endDate, status, courierId);
    success(res, "Shipment report fetched", result);
  }),

  getCourierReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, courierId } = req.query as {
      startDate?: string;
      endDate?: string;
      courierId?: string;
    };
    const result = await reportService.getCourierReport(workspaceId, startDate, endDate, courierId);
    success(res, "Courier report fetched", result);
  }),

  getCustomerReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, customerId } = req.query as {
      startDate?: string;
      endDate?: string;
      customerId?: string;
    };
    const result = await reportService.getCustomerReport(workspaceId, startDate, endDate, customerId);
    success(res, "Customer report fetched", result);
  }),

  getDeliveryReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, status } = req.query as {
      startDate?: string;
      endDate?: string;
      status?: string;
    };
    const result = await reportService.getDeliveryReport(workspaceId, startDate, endDate, status);
    success(res, "Delivery report fetched", result);
  }),

  getEmployeeReport: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { startDate, endDate, employeeId } = req.query as {
      startDate?: string;
      endDate?: string;
      employeeId?: string;
    };
    const result = await reportService.getEmployeeReport(workspaceId, startDate, endDate, employeeId);
    success(res, "Employee report fetched", result);
  }),

  exportPdf: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const reportId = req.params.reportId as string;
    if (!reportId) throw new ApiError(400, "Report ID is required");
    const report = await reportService.exportPdf(workspaceId, reportId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="report-${reportId}.json"`);
    res.status(200).json({ success: true, message: "Report data exported", data: report });
  }),

  exportExcel: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const reportId = req.params.reportId as string;
    if (!reportId) throw new ApiError(400, "Report ID is required");
    const report = await reportService.exportExcel(workspaceId, reportId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="report-${reportId}.json"`);
    res.status(200).json({ success: true, message: "Report data exported", data: report });
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = req.workspaceId!;
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await reportService.getHistory(workspaceId, Number(page) || 1, Number(limit) || 20);
    success(res, "Report history fetched", result);
  }),
};
