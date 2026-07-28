import { Role } from "../../generated/prisma/client.js";

import { PERMISSION } from "../../permissions/permission.types.js";

import { assertPermission } from "../../permissions/rolePermissions.js";

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

function assertCanReadActivities(actor: ActivityActorContext): void {
  assertPermission(
    actor.role,
    PERMISSION.ACTIVITY_READ,
    ACTIVITY_MESSAGES.forbidden,
  );
}

function applyListRoleScope(
  actor: ActivityActorContext,
  query: ActivityListQuery,
): ActivityListQuery {
  if (actor.role === Role.VIEWER) {
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
  if (actor.role === Role.VIEWER) {
    return {
      ...query,
      userId: actor.userId,
    };
  }

  return query;
}

function calculateTotalPages(total: number, limit: number): number {
  if (total === 0) {
    return 0;
  }

  return Math.ceil(total / limit);
}

export const activityService = {
  async list(actor: ActivityActorContext, query: ActivityListQuery) {
    assertCanReadActivities(actor);

    const scopedQuery = applyListRoleScope(actor, query);

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

        totalPages: calculateTotalPages(result.total, scopedQuery.limit),
      },
    };
  },

  async listMine(actor: ActivityActorContext, query: ActivityListQuery) {
    assertCanReadActivities(actor);

    const scopedQuery: ActivityListQuery = {
      ...query,
      userId: actor.userId,
    };

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

        totalPages: calculateTotalPages(result.total, scopedQuery.limit),
      },
    };
  },

  async recent(actor: ActivityActorContext, query: RecentActivityQuery) {
    assertCanReadActivities(actor);

    const scopedQuery = applyRecentRoleScope(actor, query);

    const activities = await activityRepository.recent(
      actor.workspaceId,
      scopedQuery,
    );

    return mapActivities(activities);
  },

  async getById(actor: ActivityActorContext, activityId: string) {
    assertCanReadActivities(actor);

    const activity = await activityRepository.findById(
      activityId,
      actor.workspaceId,
    );

    if (!activity) {
      throw new ApiError(404, ACTIVITY_MESSAGES.notFound);
    }

    if (actor.role === Role.VIEWER && activity.userId !== actor.userId) {
      throw new ApiError(403, ACTIVITY_MESSAGES.forbidden);
    }

    return mapActivity(activity);
  },

  async getSummary(actor: ActivityActorContext, query: ActivitySummaryQuery) {
    assertCanReadActivities(actor);

    const userId = actor.role === Role.VIEWER ? actor.userId : query.userId;

    return activityRepository.getSummary(actor.workspaceId, userId);
  },

  async remove(actor: ActivityActorContext, activityId: string): Promise<void> {
    assertPermission(
      actor.role,
      PERMISSION.ACTIVITY_DELETE,
      ACTIVITY_MESSAGES.forbidden,
    );

    const result = await activityRepository.deleteById(
      activityId,
      actor.workspaceId,
    );

    if (result.count === 0) {
      throw new ApiError(404, ACTIVITY_MESSAGES.notFound);
    }
  },

  async clear(actor: ActivityActorContext, input: ClearActivityInput) {
    assertPermission(
      actor.role,
      PERMISSION.ACTIVITY_CLEAR,
      ACTIVITY_MESSAGES.forbidden,
    );

    const result = await activityRepository.clear(actor.workspaceId, input);

    return {
      deletedCount: result.count,
    };
  },
};
