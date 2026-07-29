import { WORKSPACE_ACTIVITY_LIMIT, WORKSPACE_OVERVIEW_DAYS, WORKSPACE_TOP_THEMES_LIMIT } from "./workspace.constants.js";

import { mapWorkspaceFull } from "./workspace.mapper.js";

import { workspaceRepository } from "./workspace.repository.js";

import type {
  FeedbackTrend,
  RecentActivityItem,
  TopTheme,
  WorkspaceOverview,
} from "./workspace.types.js";

function buildFeedbackTrend(
  feedbacks: { createdAt: Date }[],
  days: number,
): FeedbackTrend[] {
  const map = new Map<string, number>();

  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    map.set(key, 0);
  }

  for (const fb of feedbacks) {
    const key = fb.createdAt.toISOString().slice(0, 10);
    if (map.has(key)) {
      map.set(key, (map.get(key) as number) + 1);
    }
  }

  return Array.from(map.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

function buildDepartmentDistribution(
  groups: {
    department: string | null;
    _count: { department: number };
  }[],
) {
  return groups
    .filter((g) => g.department !== null)
    .map((g) => ({
      department: g.department as string,
      count: g._count.department,
    }));
}

export const workspaceOverviewService = {
  async getOverview(workspaceId: string): Promise<WorkspaceOverview> {
    const since = new Date();
    since.setDate(since.getDate() - WORKSPACE_OVERVIEW_DAYS);

    const [
      workspace,
      summary,
      activityLogs,
      feedbacks,
      themes,
      departmentGroups,
    ] = await Promise.all([
      workspaceRepository.findFullById(workspaceId),
      workspaceRepository.getSummary(workspaceId),
      workspaceRepository.getRecentActivity(
        workspaceId,
        WORKSPACE_ACTIVITY_LIMIT,
      ),
      workspaceRepository.getFeedbackTrend(workspaceId, since),
      workspaceRepository.getTopThemes(
        workspaceId,
        WORKSPACE_TOP_THEMES_LIMIT,
      ),
      workspaceRepository.getDepartmentDistribution(workspaceId),
    ]);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const recentActivity: RecentActivityItem[] = activityLogs.map((log) => ({
      id: log.id,
      type: log.type,
      title: log.title,
      description: log.description,
      userName: log.user?.name ?? null,
      createdAt: log.createdAt,
    }));

    const topThemes: TopTheme[] = themes.map((t) => ({
      id: t.id,
      name: t.name,
      count: t._count.feedbackThemes,
    }));

    const feedbackTrend = buildFeedbackTrend(feedbacks, WORKSPACE_OVERVIEW_DAYS);

    const departmentDistribution = buildDepartmentDistribution(departmentGroups);

    return {
      workspace: mapWorkspaceFull(workspace),
      summary,
      recentActivity,
      feedbackTrend,
      topThemes,
      departmentDistribution,
    };
  },
};
