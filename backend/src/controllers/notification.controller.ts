import * as notificationService from "../services/notification.service.js";
import { success } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import type { Request, Response } from "express";
import { getUserId } from "../utils/requestContext.js";

export const notificationController = {
  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId;
    const { page, limit, isRead } = req.query as {
      page?: string;
      limit?: string;
      isRead?: string;
    };
    const result = await notificationService.list(
      userId(req),
      Number(page) || 1,
      Number(limit) || 20,
      isRead === "true" ? true : isRead === "false" ? false : undefined,
    );
    success(res, "Notification history fetched", result);
  }),

  getDeliveryAlerts: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await notificationService.getDeliveryAlerts(
      userId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    success(res, "Delivery alerts fetched", result);
  }),

  getFailedNotifications: asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await notificationService.getFailedNotifications(
      userId,
      Number(page) || 1,
      Number(limit) || 20,
    );
    success(res, "Failed notifications fetched", result);
  }),
};
