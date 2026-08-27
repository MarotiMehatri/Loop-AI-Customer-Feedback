
import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";
import { feedbackImportRouter } from "../modules/feedback-import/index.js";
import { feedbackRouter } from "../modules/feedback/feedback.routes.js";
import { feedbackInboxRouter } from "../modules/feedback-inbox/feedbackInbox.routes.js";
import { analyticsRouter } from "../modules/analytics/analytics.routes.js";
import { askLoopRouter } from "../modules/ask-loop/index.js";
import reportRouter from "../modules/reports/report.routes.js";
import { authenticate } from "../middleware/authenticate.middleware.js";
import memberRouter from "../modules/members/member.routes.js";
import profileRouter from "../modules/profile/profile.routes.js";
import { activityRoutes as activityRouter } from "../modules/activity/activity.routes.js";
import settingsRouter from "../modules/settings/settings.routes.js";
import themeRouter from "../modules/themes/theme.routes.js";
import dashboardRouter from "../modules/dashboard/dashboard.routes.js";
import workspaceRouter from "../modules/workspace/workspace.routes.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { healthRouter } from "../modules/health/index.js";
import { savedViewsRouter } from "../modules/saved-views/index.js";
import { trendsRouter } from "../modules/trends/index.js";
import { classificationRouter } from "../modules/ai-classification/index.js";
import { dataSourcesRouter } from "../modules/data-sources/index.js";
import { exportsRouter } from "../modules/exports/index.js";

export const apiRouter = Router();

/**
 * API root
 *
 * GET /api/v1
 */
apiRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LOOP API is running",
    version: "1.0.0",
  });
});

/**
 * Health
 *
 * GET /api/v1/health
 */
apiRouter.use("/health", healthRouter);

/**
 * Authentication
 *
 * POST /api/v1/auth/login
 * POST /api/v1/auth/signup
 * POST /api/v1/auth/register
 * etc.
 */
apiRouter.use("/auth", authRouter);

/**
 * Dashboard
 */
apiRouter.use("/dashboard", dashboardRouter);

/**
 * Feedback
 */
apiRouter.use("/feedback", feedbackRouter);

apiRouter.use(
  "/feedback-import",
  feedbackImportRouter,
);

apiRouter.use(
  "/feedback-inbox",
  feedbackInboxRouter,
);

/**
 * Analytics
 */
apiRouter.use("/analytics", analyticsRouter);

/**
 * AI
 */
apiRouter.use("/ask-loop", askLoopRouter);

apiRouter.use(
  "/ai-classification",
  classificationRouter,
);

/**
 * Reports
 */
apiRouter.use("/reports", reportRouter);

/**
 * Members
 */
apiRouter.use(
  "/members",
  authenticate,
  memberRouter,
);

/**
 * Profile
 */
apiRouter.use("/profile", profileRouter);

/**
 * Activity
 */
apiRouter.use("/activity", activityRouter);

/**
 * Notifications
 */
apiRouter.use(
  "/notifications",
  notificationRoutes,
);

/**
 * Settings
 */
apiRouter.use("/settings", settingsRouter);

/**
 * Theme
 */
apiRouter.use("/theme", themeRouter);

/**
 * Saved views
 */
apiRouter.use(
  "/saved-views",
  savedViewsRouter,
);

/**
 * Trends
 */
apiRouter.use("/trends", trendsRouter);

/**
 * Data sources
 */
apiRouter.use(
  "/data-sources",
  dataSourcesRouter,
);

/**
 * Exports
 */
apiRouter.use("/exports", exportsRouter);

/**
 * Workspace
 */
apiRouter.use(
  "/workspace",
  workspaceRouter,
);