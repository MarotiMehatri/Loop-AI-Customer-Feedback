import { logger } from "../../config/logger.js";

import { notificationRepository } from "./notification.repository.js";

import type { PublishNotificationInput } from "./notification.types.js";

async function publishNotification(input: PublishNotificationInput) {
  return notificationRepository.create(input);
}

async function publishManyNotifications(inputs: PublishNotificationInput[]) {
  if (inputs.length === 0) {
    return {
      count: 0,
    };
  }

  return notificationRepository.createMany(inputs);
}

async function publishNotificationSafe(
  input: PublishNotificationInput,
): Promise<void> {
  try {
    await publishNotification(input);
  } catch (error) {
    logger.error({
      module: "notifications",

      message: "Unable to publish notification",

      notificationType: input.type,

      userId: input.userId,

      workspaceId: input.workspaceId,

      error:
        error instanceof Error
          ? {
              name: error.name,

              message: error.message,

              stack: error.stack,
            }
          : error,
    });
  }
}

async function publishManyNotificationsSafe(
  inputs: PublishNotificationInput[],
): Promise<void> {
  if (inputs.length === 0) {
    return;
  }

  try {
    await publishManyNotifications(inputs);
  } catch (error) {
    logger.error({
      module: "notifications",

      message: "Unable to publish multiple notifications",

      notificationCount: inputs.length,

      workspaceId: inputs[0]?.workspaceId,

      error:
        error instanceof Error
          ? {
              name: error.name,

              message: error.message,

              stack: error.stack,
            }
          : error,
    });
  }
}

export const notificationPublisher = {
  publish: publishNotification,

  publishMany: publishManyNotifications,

  publishSafe: publishNotificationSafe,

  publishManySafe: publishManyNotificationsSafe,
};
