import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";
import { TREND_MESSAGES } from "./trend.constants.js";
import { trendsService } from "./trends.service.js";
import type { TrendActorContext } from "./trends.types.js";

function getTrendContext(request: Request): TrendActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, TREND_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, TREND_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

export const trendsController: {
  getTrends: RequestHandler;
  getTrendsComparison: RequestHandler;
  detectTrend: RequestHandler;
  detectAnomalies: RequestHandler;
  generateForecast: RequestHandler;
  generateInsights: RequestHandler;
} = {
  getTrends: async (request, response, next) => {
    try {
      const actor = getTrendContext(request);

      const { period, metric, startDate, endDate } =
        request.query as unknown as {
          period: string;
          metric: string;
          startDate?: string;
          endDate?: string;
        };

      const result = await trendsService.getTrends(
        actor,
        metric as never,
        period as never,
        startDate,
        endDate,
      );

      response.status(200).json({
        success: true,
        message: TREND_MESSAGES.listed,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getTrendsComparison: async (request, response, next) => {
    try {
      const actor = getTrendContext(request);

      const { currentPeriod, previousPeriod, metric, startDate, endDate } =
        request.query as unknown as {
          currentPeriod: string;
          previousPeriod: string;
          metric: string;
          startDate?: string;
          endDate?: string;
        };

      const result = await trendsService.getTrendsComparison(
        actor,
        metric as never,
        currentPeriod as never,
        previousPeriod as never,
        startDate,
        endDate,
      );

      response.status(200).json({
        success: true,
        message: TREND_MESSAGES.comparisonRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  detectTrend: async (request, response, next) => {
    try {
      const actor = getTrendContext(request);

      const result = await trendsService.detectTrend(
        actor,
        request.query as never,
      );

      response.status(200).json({
        success: true,
        message: TREND_MESSAGES.detectionCompleted,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  detectAnomalies: async (request, response, next) => {
    try {
      const actor = getTrendContext(request);

      const result = await trendsService.detectAnomalies(
        actor,
        request.query as never,
      );

      response.status(200).json({
        success: true,
        message: TREND_MESSAGES.anomaliesDetected,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  generateForecast: async (request, response, next) => {
    try {
      const actor = getTrendContext(request);

      const result = await trendsService.generateForecast(
        actor,
        request.query as never,
      );

      response.status(200).json({
        success: true,
        message: TREND_MESSAGES.forecastGenerated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  generateInsights: async (request, response, next) => {
    try {
      const actor = getTrendContext(request);

      const result = await trendsService.generateInsights(
        actor,
        request.query as never,
      );

      response.status(200).json({
        success: true,
        message: TREND_MESSAGES.insightsGenerated,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
