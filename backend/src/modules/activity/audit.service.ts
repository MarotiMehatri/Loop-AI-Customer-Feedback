import { ActivityType } from "../../generated/prisma/client.js";

import { logger } from "../../config/logger.js";

import { activityRepository } from "./activity.repository.js";

import type { CreateActivityInput } from "./activity.types.js";

export interface AuditEventInput {
  userId: string;
  workspaceId: string;
  type: ActivityType;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

async function record(input: AuditEventInput): Promise<void> {
  const createInput: CreateActivityInput = {
    userId: input.userId,
    workspaceId: input.workspaceId,
    type: input.type,
    title: input.title,
    description: input.description,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: {
      ...(input.metadata ?? {}),
      ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
      ...(input.userAgent ? { userAgent: input.userAgent } : {}),
      audit: true,
    },
  };

  await activityRepository.create(createInput);
}

async function recordSafe(input: AuditEventInput): Promise<void> {
  try {
    await record(input);
  } catch (error) {
    logger.error({
      module: "audit",
      message: "Failed to record audit event",
      auditType: input.type,
      userId: input.userId,
      workspaceId: input.workspaceId,
      error: error instanceof Error
        ? { name: error.name, message: error.message }
        : error,
    });
  }
}

async function recordSecurityAlert(
  userId: string,
  workspaceId: string,
  title: string,
  description: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await recordSafe({
    userId,
    workspaceId,
    type: ActivityType.SETTINGS_UPDATED,
    title,
    description,
    metadata: { ...metadata, securityAlert: true },
  });
}

export const auditService = {
  record,
  recordSafe,
  recordSecurityAlert,
};
