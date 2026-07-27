import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import { getTrends, getTrendsComparison } from "./trends.service.js";

import type {
  GetTrendsComparisonQuery,
  GetTrendsQuery,
  TrendMetric,
  TrendPeriod,
} from "./trends.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

/**
 * GET /api/v1/trends
 */
export const getTrendsController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const { period, metric, startDate, endDate, category, source } =
    request.query as unknown as GetTrendsQuery;

  const result = await getTrends(
    user.workspaceId,
    metric,
    period,
    startDate,
    endDate,
  );

  response.status(200).json({
    success: true,
    message: "Trends retrieved successfully",
    data: result,
  });
};

/**
 * GET /api/v1/trends/comparison
 */
export const getTrendsComparisonController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const { currentPeriod, previousPeriod, metric, startDate, endDate } =
    request.query as unknown as GetTrendsComparisonQuery;

  const result = await getTrendsComparison(
    user.workspaceId,
    metric,
    currentPeriod,
    previousPeriod,
    startDate,
    endDate,
  );

  response.status(200).json({
    success: true,
    message: "Trends comparison retrieved successfully",
    data: result,
  });
};
