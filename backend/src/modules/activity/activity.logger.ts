import type { Request } from "express";

import { logger } from "../../config/logger.js";

import { activityRepository } from "./activity.repository.js";

import type { CreateActivityInput } from "./activity.types.js";

export interface ActivityLoggerInput extends CreateActivityInput {
  request?: Request;
}

function getRequestIp(request: Request): string | null {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] ?? null;
  }

  return request.ip || null;
}

function getUserAgent(request: Request): string | null {
  return request.headers["user-agent"] ?? null;
}

function buildLoggerMetadata(
  input: ActivityLoggerInput,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    ...(input.metadata ?? {}),
  };

  if (input.request) {
    const ipAddress = getRequestIp(input.request);

    const userAgent = getUserAgent(input.request);

    if (ipAddress) {
      metadata.ipAddress = ipAddress;
    }

    if (userAgent) {
      metadata.userAgent = userAgent;
    }

    metadata.method = input.request.method;

    metadata.path = input.request.originalUrl;
  }

  return metadata;
}

export const activityLogger = {
  async log(input: ActivityLoggerInput) {
    return activityRepository.create({
      userId: input.userId,
      workspaceId: input.workspaceId,

      type: input.type,

      title: input.title,
      description: input.description,

      entityType: input.entityType,
      entityId: input.entityId,

      metadata: buildLoggerMetadata(input),
    });
  },

  async logSafe(input: ActivityLoggerInput): Promise<void> {
    try {
      await this.log(input);
    } catch (error) {
      logger.error({
        module: "activity",
        message: "Unable to save activity log",
        activityType: input.type,
        userId: input.userId,
        workspaceId: input.workspaceId,
        error,
      });
    }
  },
};
