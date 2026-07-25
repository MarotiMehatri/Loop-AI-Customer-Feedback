import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildDateFilter } from "./dashboard.query.js";

import type {
  DashboardFeedbackRecord,
  DashboardThemeLinkRecord,
} from "./dashboard.types.js";

const dashboardFeedbackSelect = {
  id: true,
  content: true,
  sentiment: true,
  source: true,
  status: true,
  createdAt: true,
} satisfies Prisma.FeedbackSelect;

async function getFeedbackForPeriod(
  workspaceId: string,
  startDate: Date,
  endDate: Date,
): Promise<DashboardFeedbackRecord[]> {
  return prisma.feedback.findMany({
    where: {
      workspaceId,
      createdAt: buildDateFilter(startDate, endDate),
    },
    select: dashboardFeedbackSelect,
    orderBy: {
      createdAt: "asc",
    },
  });
}

async function countActiveUsers(
  workspaceId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  return prisma.user.count({
    where: {
      workspaceId,
      isActive: true,
      lastLoginAt: buildDateFilter(startDate, endDate),
    },
  });
}

async function getThemeLinksForPeriod(
  workspaceId: string,
  startDate: Date,
  endDate: Date,
): Promise<DashboardThemeLinkRecord[]> {
  return prisma.feedbackTheme.findMany({
    where: {
      theme: {
        workspaceId,
      },
      feedback: {
        workspaceId,
        createdAt: buildDateFilter(startDate, endDate),
      },
    },
    select: {
      feedbackId: true,
      theme: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });
}

export const dashboardRepository = {
  getFeedbackForPeriod,
  countActiveUsers,
  getThemeLinksForPeriod,
};
