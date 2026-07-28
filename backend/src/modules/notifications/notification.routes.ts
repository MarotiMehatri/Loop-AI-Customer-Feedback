import { Router } from "express";

import { notificationController } from "./notification.controller.js";

const router = Router();

/**
 * Authentication and workspace middleware should be applied
 * before these routes are mounted in src/routes/index.ts or app.ts.
 */

router.get("/", notificationController.list);

router.get("/unread-count", notificationController.getUnreadCount);

router.patch("/read-all", notificationController.markAllAsRead);

router.delete("/read", notificationController.removeRead);

router.delete("/", notificationController.clear);

router.get("/:notificationId", notificationController.getById);

router.patch("/:notificationId/read", notificationController.markAsRead);

router.patch("/:notificationId/unread", notificationController.markAsUnread);

router.delete("/:notificationId", notificationController.remove);

export const notificationRoutes = router;
