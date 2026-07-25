import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { DASHBOARD_MESSAGES } from "./dashboard.constants.js";

import { dashboardService } from "./dashboard.service.js";

import type { DashboardContext, DashboardQuery } from "./dashboard.types.js";

function getDashboardContext(request: Request): DashboardContext {
  const userId = request.user?.userId;

  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, DASHBOARD_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, DASHBOARD_MESSAGES.workspaceRequired);
  }

  return {
    userId,
    workspaceId,
    role,
  };
}

function getDashboardQuery(request: Request): DashboardQuery {
  return request.query as unknown as DashboardQuery;
}

export const dashboardController: {
  getDashboard: RequestHandler;
  getSummary: RequestHandler;
  getCharts: RequestHandler;
  getTopThemes: RequestHandler;
  getRecentFeedback: RequestHandler;
} = {
  getDashboard: async (request, response, next) => {
    try {
      const result = await dashboardService.getDashboard(
        getDashboardContext(request),
        getDashboardQuery(request),
      );

      response.status(200).json({
        success: true,
        message: DASHBOARD_MESSAGES.retrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getSummary: async (request, response, next) => {
    try {
      const result = await dashboardService.getSummary(
        getDashboardContext(request),
        getDashboardQuery(request),
      );

      response.status(200).json({
        success: true,
        message: DASHBOARD_MESSAGES.summaryRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getCharts: async (request, response, next) => {
    try {
      const result = await dashboardService.getCharts(
        getDashboardContext(request),
        getDashboardQuery(request),
      );

      response.status(200).json({
        success: true,
        message: DASHBOARD_MESSAGES.chartsRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getTopThemes: async (request, response, next) => {
    try {
      const result = await dashboardService.getTopThemes(
        getDashboardContext(request),
        getDashboardQuery(request),
      );

      response.status(200).json({
        success: true,
        message: DASHBOARD_MESSAGES.themesRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getRecentFeedback: async (request, response, next) => {
    try {
      const result = await dashboardService.getRecentFeedback(
        getDashboardContext(request),
        getDashboardQuery(request),
      );

      response.status(200).json({
        success: true,
        message: DASHBOARD_MESSAGES.feedbackRetrieved,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
