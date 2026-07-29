import { FeedbackStatus, Sentiment } from "../../generated/prisma/client.js";

import { dashboardCache } from "./dashboard.cache.js";

import { DASHBOARD_QUICK_ACTIONS } from "./dashboard.constants.js";

import {
  buildFeedbackOverTime,
  buildSentimentDistribution,
  buildSentimentOverTime,
  buildSourceDistribution,
  buildTopThemes,
  calculateMetric,
  calculatePercentage,
  mapRecentFeedback,
} from "./dashboard.mapper.js";

import { assertDashboardAccess } from "./dashboard.permissions.js";

import { resolveDashboardPeriod } from "./dashboard.query.js";

import { dashboardRepository } from "./dashboard.repository.js";

import type {
  DashboardContext,
  DashboardFeedbackRecord,
  DashboardQuery,
  DashboardResponse,
} from "./dashboard.types.js";

function countNegative(feedback: DashboardFeedbackRecord[]): number {
  return feedback.filter((item) => item.sentiment === Sentiment.NEGATIVE)
    .length;
}

function countNewFeedback(feedback: DashboardFeedbackRecord[]): number {
  return feedback.filter((item) => item.status === FeedbackStatus.NEW).length;
}

export const dashboardService = {
  async getDashboard(
    context: DashboardContext,
    query: DashboardQuery,
  ): Promise<DashboardResponse> {
    assertDashboardAccess(context.role);
<<<<<<< HEAD
=======
    assertPermission(
      context.role,
      PERMISSION.DASHBOARD_READ,
      "You do not have permission to view the Admin dashboard",
    );
>>>>>>> ec9119b (feat(frontend): set up admin pages, components, services, hooks, types, and responsive layouts)

    const period = resolveDashboardPeriod(query);

    const cacheKey = dashboardCache.createKey(
      context.workspaceId,
      period.startDate,
      period.endDate,
      query.recentLimit,
      query.topThemesLimit,
    );

    const cached = dashboardCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const [
      currentFeedback,
      previousFeedback,
      currentActiveUsers,
      previousActiveUsers,
      themeLinks,
    ] = await Promise.all([
      dashboardRepository.getFeedbackForPeriod(
        context.workspaceId,
        period.startDate,
        period.endDate,
      ),
      dashboardRepository.getFeedbackForPeriod(
        context.workspaceId,
        period.previousStartDate,
        period.previousEndDate,
      ),
      dashboardRepository.countActiveUsers(
        context.workspaceId,
        period.startDate,
        period.endDate,
      ),
      dashboardRepository.countActiveUsers(
        context.workspaceId,
        period.previousStartDate,
        period.previousEndDate,
      ),
      dashboardRepository.getThemeLinksForPeriod(
        context.workspaceId,
        period.startDate,
        period.endDate,
      ),
    ]);

    const currentTotal = currentFeedback.length;
    const previousTotal = previousFeedback.length;

    const currentNegative = countNegative(currentFeedback);
    const previousNegative = countNegative(previousFeedback);

    const currentNegativePercentage = calculatePercentage(
      currentNegative,
      currentTotal,
    );

    const previousNegativePercentage = calculatePercentage(
      previousNegative,
      previousTotal,
    );

    const currentNewFeedback = countNewFeedback(currentFeedback);
    const previousNewFeedback = countNewFeedback(previousFeedback);

    const topThemes = buildTopThemes(
      themeLinks,
      currentTotal,
      query.topThemesLimit,
    );

    const topTheme = topThemes[0];

    const response: DashboardResponse = {
      period,
      summary: {
        totalFeedback: calculateMetric(currentTotal, previousTotal),
        negativeFeedback: calculateMetric(
          currentNegativePercentage,
          previousNegativePercentage,
        ),
        newFeedback: calculateMetric(currentNewFeedback, previousNewFeedback),
        activeUsers: calculateMetric(currentActiveUsers, previousActiveUsers),
        topTheme: topTheme
          ? {
              id: topTheme.id,
              name: topTheme.name,
              color: topTheme.color,
              feedbackCount: topTheme.feedbackCount,
              percentage: topTheme.percentage,
            }
          : {
              id: null,
              name: null,
              color: null,
              feedbackCount: 0,
              percentage: 0,
            },
      },
      charts: {
        feedbackOverTime: buildFeedbackOverTime(
          currentFeedback,
          period.startDate,
          period.endDate,
        ),
        sentimentDistribution: buildSentimentDistribution(currentFeedback),
        sourceDistribution: buildSourceDistribution(currentFeedback),
        sentimentOverTime: buildSentimentOverTime(
          currentFeedback,
          period.startDate,
          period.endDate,
        ),
      },
      topThemes,
      recentFeedback: mapRecentFeedback(currentFeedback, query.recentLimit),
      quickActions: DASHBOARD_QUICK_ACTIONS,
      generatedAt: new Date(),
    };

    dashboardCache.set(cacheKey, response);

    return response;
  },

  async getSummary(context: DashboardContext, query: DashboardQuery) {
    const dashboard = await this.getDashboard(context, query);

    return {
      period: dashboard.period,
      summary: dashboard.summary,
      generatedAt: dashboard.generatedAt,
    };
  },

  async getCharts(context: DashboardContext, query: DashboardQuery) {
    const dashboard = await this.getDashboard(context, query);

    return {
      period: dashboard.period,
      charts: dashboard.charts,
      generatedAt: dashboard.generatedAt,
    };
  },

  async getTopThemes(context: DashboardContext, query: DashboardQuery) {
    const dashboard = await this.getDashboard(context, query);

    return {
      period: dashboard.period,
      items: dashboard.topThemes,
      generatedAt: dashboard.generatedAt,
    };
  },

  async getRecentFeedback(context: DashboardContext, query: DashboardQuery) {
    const dashboard = await this.getDashboard(context, query);

    return {
      period: dashboard.period,
      items: dashboard.recentFeedback,
      generatedAt: dashboard.generatedAt,
    };
  },
};
