import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import { dashboardController } from "./dashboard.controller.js";

import { dashboardQuerySchema } from "./dashboard.validator.js";

const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.use(authorize("ADMIN", "ANALYST", "VIEWER"));

const validateDashboardQuery = validate(dashboardQuerySchema);

dashboardRouter.get(
  "/summary",
  validateDashboardQuery,
  dashboardController.getSummary,
);

dashboardRouter.get(
  "/charts",
  validateDashboardQuery,
  dashboardController.getCharts,
);

dashboardRouter.get(
  "/top-themes",
  validateDashboardQuery,
  dashboardController.getTopThemes,
);

dashboardRouter.get(
  "/recent-feedback",
  validateDashboardQuery,
  dashboardController.getRecentFeedback,
);

dashboardRouter.get(
  "/",
  validateDashboardQuery,
  dashboardController.getDashboard,
);

export default dashboardRouter;
