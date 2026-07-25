import type { Request, Response } from "express";

import * as trackingService from "../services/tracking.service.js";

import { ApiError } from "../utils/apiError.js";

import { success } from "../utils/apiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";

import { getWorkspaceId } from "../utils/requestContext.js";

export const trackingController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);

    const { q, page, limit } = req.query as {
      q?: string;
      page?: string;
      limit?: string;
    };

    if (!q?.trim()) {
      throw new ApiError(400, "Search query is required");
    }

    const result = await trackingService.search(
      workspaceId,
      q.trim(),
      Number(page) || 1,
      Number(limit) || 20,
    );

    success(res, "Search results fetched", result);
  }),

  timeline: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);

    const shipmentId = req.params.shipmentId as string;

    if (!shipmentId) {
      throw new ApiError(400, "Shipment ID is required");
    }

    const result = await trackingService.timeline(workspaceId, shipmentId);

    success(res, "Shipment timeline fetched", result);
  }),

  status: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);

    const shipmentId = req.params.shipmentId as string;

    if (!shipmentId) {
      throw new ApiError(400, "Shipment ID is required");
    }

    const result = await trackingService.status(workspaceId, shipmentId);

    success(res, "Shipment status fetched", result);
  }),

  parcelHistory: asyncHandler(async (req: Request, res: Response) => {
    const workspaceId = getWorkspaceId(req);

    const customerId =
      (req.params.customerId as string | undefined) ??
      (req.query.customerId as string | undefined);

    if (!customerId) {
      throw new ApiError(400, "Customer ID is required");
    }

    const { page, limit } = req.query as {
      page?: string;
      limit?: string;
    };

    const result = await trackingService.parcelHistory(
      workspaceId,
      customerId,
      Number(page) || 1,
      Number(limit) || 20,
    );

    success(res, "Parcel history fetched", result);
  }),
};
