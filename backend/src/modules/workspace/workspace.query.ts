import type { Prisma } from "../../generated/prisma/client.js";

export function buildWorkspaceSelect() {
  return {
    id: true,
    name: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
    settings: {
      select: {
        general: true,
        ai: true,
        feedback: true,
        reports: true,
        security: true,
        retention: true,
        notifications: true,
      },
    },
  } as const;
}

export function buildWorkspaceActivitySelect() {
  return {
    id: true,
    type: true,
    title: true,
    description: true,
    createdAt: true,
    userId: true,
  } as const;
}

export function buildFeedbackTrendWhere(
  workspaceId: string,
  since: Date,
): Prisma.FeedbackWhereInput {
  return {
    workspaceId,
    createdAt: { gte: since },
  };
}
