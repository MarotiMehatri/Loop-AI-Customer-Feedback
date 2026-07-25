import type { Prisma } from "../../generated/prisma/client.js";

import type { ActivityResponse } from "./activity.types.js";

export type ActivityRecord = Prisma.ActivityLogGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        role: true;
      };
    };
  };
}>;

function readMetadataString(
  metadata: unknown,
  property: string,
): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[property];

  return typeof value === "string" ? value : null;
}

export function mapActivity(activity: ActivityRecord): ActivityResponse {
  return {
    id: activity.id,
    type: activity.type,

    title: activity.title,
    description: activity.description,

    entityType: readMetadataString(activity.metadata, "entityType"),

    entityId: readMetadataString(activity.metadata, "entityId"),

    metadata: activity.metadata,

    userId: activity.userId,
    workspaceId: activity.workspaceId,

    user: {
      id: activity.user.id,
      name: activity.user.name,
      email: activity.user.email,
      role: activity.user.role,
    },

    createdAt: activity.createdAt,
  };
}

export function mapActivities(
  activities: ActivityRecord[],
): ActivityResponse[] {
  return activities.map(mapActivity);
}
