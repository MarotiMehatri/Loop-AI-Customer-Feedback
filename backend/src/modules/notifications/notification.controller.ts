import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";

import { NOTIFICATION_MESSAGES } from "./notification.constants.js";

import { notificationService } from "./notification.service.js";

import type {
  NotificationClearQuery,
  NotificationContext,
  NotificationListQuery,
} from "./notification.types.js";

function getNotificationContext(request: Request): NotificationContext {
  const userId = request.user?.userId;

  const workspaceId = request.workspaceId ?? request.user?.workspaceId;

  if (!userId) {
    throw new ApiError(401, NOTIFICATION_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, NOTIFICATION_MESSAGES.workspaceRequired);
  }

  return {
    userId,
    workspaceId,
  };
}

export const notificationController: {
  list: RequestHandler;
  getById: RequestHandler;
  unreadCount: RequestHandler;
  markAsRead: RequestHandler;
  markAllAsRead: RequestHandler;
  remove: RequestHandler;
  clear: RequestHandler;
} = {
  list: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const result = await notificationService.list(
        context,

        request.query as unknown as NotificationListQuery,
      );

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.listed,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const notificationId = request.params.notificationId as string;

      const result = await notificationService.getById(context, notificationId);

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.retrieved,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  unreadCount: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const result = await notificationService.getUnreadCount(context);

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.unreadCountRetrieved,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const notificationId = request.params.notificationId as string;

      const result = await notificationService.markAsRead(
        context,
        notificationId,
      );

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.markedAsRead,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const result = await notificationService.markAllAsRead(context);

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.allMarkedAsRead,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  remove: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const notificationId = request.params.notificationId as string;

      await notificationService.remove(context, notificationId);

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.deleted,
      });
    } catch (error) {
      next(error);
    }
  },

  clear: async (request, response, next) => {
    try {
      const context = getNotificationContext(request);

      const result = await notificationService.clear(
        context,

        request.query as unknown as NotificationClearQuery,
      );

      response.status(200).json({
        success: true,

        message: NOTIFICATION_MESSAGES.cleared,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
