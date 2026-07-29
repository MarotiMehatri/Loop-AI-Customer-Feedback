import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { authorize } from "../../middleware/authorize.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  clearController,
  getByIdController,
  getUnreadCountController,
  listController,
  markAllAsReadController,
  markAsReadController,
  markAsUnreadController,
  removeController,
  removeReadController,
} from "./notification.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(listController),
);

router.get(
  "/unread-count",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(getUnreadCountController),
);

router.patch(
  "/read-all",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(markAllAsReadController),
);

router.delete(
  "/read",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(removeReadController),
);

router.delete(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(clearController),
);

router.get(
  "/:notificationId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(getByIdController),
);

router.patch(
  "/:notificationId/read",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(markAsReadController),
);

router.patch(
  "/:notificationId/unread",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(markAsUnreadController),
);

router.delete(
  "/:notificationId",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(removeController),
);

export { router as notificationRoutes };
