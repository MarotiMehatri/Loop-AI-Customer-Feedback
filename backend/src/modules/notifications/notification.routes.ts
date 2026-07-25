import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { notificationController } from "./notification.controller.js";

import {
  clearNotificationsSchema,
  listNotificationsSchema,
  notificationIdSchema,
} from "./notification.validator.js";

const notificationRouter = Router();

/*
 * Static routes must be registered
 * before /:notificationId.
 */

notificationRouter.get("/unread-count", notificationController.unreadCount);

notificationRouter.patch("/read-all", notificationController.markAllAsRead);

notificationRouter.get(
  "/",
  validate(listNotificationsSchema),
  notificationController.list,
);

notificationRouter.delete(
  "/",
  validate(clearNotificationsSchema),
  notificationController.clear,
);

notificationRouter.get(
  "/:notificationId",
  validate(notificationIdSchema),
  notificationController.getById,
);

notificationRouter.patch(
  "/:notificationId/read",
  validate(notificationIdSchema),
  notificationController.markAsRead,
);

notificationRouter.delete(
  "/:notificationId",
  validate(notificationIdSchema),
  notificationController.remove,
);

export default notificationRouter;
