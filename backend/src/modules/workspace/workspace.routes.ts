import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { authorize } from "../../middleware/authorize.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import { asyncHandler } from "../../utils/asyncHandler.js";

import {
  availableWorkspacesController,
  createWorkspaceController,
  deleteWorkspaceController,
  getFullWorkspaceController,
  getWorkspaceController,
  switchWorkspaceController,
  updateWorkspaceController,
  workspaceHealthController,
  workspaceOverviewController,
  workspaceSummaryController,
  workspaceUsageController,
} from "./workspace.controller.js";

import {
  createWorkspaceSchema,
  deleteWorkspaceSchema,
  switchWorkspaceSchema,
  updateWorkspaceSchema,
  usageQuerySchema,
} from "./workspace.validator.js";

const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.get(
  "/",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(getWorkspaceController),
);

workspaceRouter.get(
  "/full",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(getFullWorkspaceController),
);

workspaceRouter.get(
  "/overview",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(workspaceOverviewController),
);

workspaceRouter.get(
  "/summary",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(workspaceSummaryController),
);

workspaceRouter.get(
  "/health",
  authorize("ADMIN", "ANALYST"),
  asyncHandler(workspaceHealthController),
);

workspaceRouter.get(
  "/usage",
  authorize("ADMIN", "ANALYST"),
  validate(usageQuerySchema),
  asyncHandler(workspaceUsageController),
);

workspaceRouter.get(
  "/available",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  asyncHandler(availableWorkspacesController),
);

workspaceRouter.post(
  "/switch",
  authorize("ADMIN", "ANALYST", "VIEWER"),
  validate(switchWorkspaceSchema),
  asyncHandler(switchWorkspaceController),
);

workspaceRouter.post(
  "/",
  authorize("ADMIN"),
  validate(createWorkspaceSchema),
  asyncHandler(createWorkspaceController),
);

workspaceRouter.patch(
  "/",
  authorize("ADMIN"),
  validate(updateWorkspaceSchema),
  asyncHandler(updateWorkspaceController),
);

workspaceRouter.delete(
  "/",
  authorize("ADMIN"),
  validate(deleteWorkspaceSchema),
  asyncHandler(deleteWorkspaceController),
);

export default workspaceRouter;
