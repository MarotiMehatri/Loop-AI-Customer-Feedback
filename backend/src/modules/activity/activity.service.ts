import type { Role } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { ACTIVITY_MESSAGES } from "./activity.constants.js";

import { mapActivities, mapActivity } from "./activity.mapper.js";

import { activityRepository } from "./activity.repository.js";

import type {
  ActivityActorContext,
  ActivityListQuery,
  ActivitySummaryQuery,
  ClearActivityInput,
  RecentActivityQuery,
} from "./activity.types.js";

function isAdmin(role: Role): boolean {
  return role === "ADMIN";
}

function applyRoleScope(
  actor: ActivityActorContext,
  query: ActivityListQuery,
): ActivityListQuery {
  if (actor.role === "VIEWER") {
    return {
      ...query,
      userId: actor.userId,
    };
  }

  return query;
}

function applyRecentRoleScope(
  actor: ActivityActorContext,
  query: RecentActivityQuery,
): RecentActivityQuery {
  if (actor.role === "VIEWER") {
    return {
      ...query,
      userId: actor.userId,
    };
  }

  return query;
}

export const activityService = {
  async list(actor: ActivityActorContext, query: ActivityListQuery) {
    const scopedQuery = applyRoleScope(actor, query);

    const result = await activityRepository.list(
      actor.workspaceId,
      scopedQuery,
    );

    return {
      items: mapActivities(result.items),

      pagination: {
        page: scopedQuery.page,
        limit: scopedQuery.limit,
        total: result.total,

        totalPages: Math.ceil(result.total / scopedQuery.limit),
      },
    };
  },

  async listMine(actor: ActivityActorContext, query: ActivityListQuery) {
    const result = await activityRepository.list(actor.workspaceId, {
      ...query,
      userId: actor.userId,
    });

    return {
      items: mapActivities(result.items),

      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,

        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async recent(actor: ActivityActorContext, query: RecentActivityQuery) {
    const scopedQuery = applyRecentRoleScope(actor, query);

    const activities = await activityRepository.recent(
      actor.workspaceId,
      scopedQuery,
    );

    return mapActivities(activities);
  },

  async getById(actor: ActivityActorContext, activityId: string) {
    const activity = await activityRepository.findById(
      activityId,
      actor.workspaceId,
    );

    if (!activity) {
      throw new ApiError(404, ACTIVITY_MESSAGES.notFound);
    }

    if (actor.role === "VIEWER" && activity.userId !== actor.userId) {
      throw new ApiError(403, ACTIVITY_MESSAGES.forbidden);
    }

    return mapActivity(activity);
  },

  async getSummary(actor: ActivityActorContext, query: ActivitySummaryQuery) {
    const userId = actor.role === "VIEWER" ? actor.userId : query.userId;

    return activityRepository.getSummary(actor.workspaceId, userId);
  },

  async remove(actor: ActivityActorContext, activityId: string): Promise<void> {
    if (!isAdmin(actor.role)) {
      throw new ApiError(403, ACTIVITY_MESSAGES.forbidden);
    }

    const result = await activityRepository.deleteById(
      activityId,
      actor.workspaceId,
    );

    if (result.count === 0) {
      throw new ApiError(404, ACTIVITY_MESSAGES.notFound);
    }
  },

  async clear(actor: ActivityActorContext, input: ClearActivityInput) {
    if (!isAdmin(actor.role)) {
      throw new ApiError(403, ACTIVITY_MESSAGES.forbidden);
    }

    const result = await activityRepository.clear(actor.workspaceId, input);

    return {
      deletedCount: result.count,
    };
  },
};
