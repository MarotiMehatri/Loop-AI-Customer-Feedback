import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { analyticsController } from "./analytics.controller.js";
import {
  createLiveUrlSchema,
  liveUrlParamsSchema,
  analyticsQuerySchema,
} from "./analytics.validator.js";

const analyticsRouter = Router();

analyticsRouter.use(authenticate);
analyticsRouter.use(authorize("ADMIN", "ANALYST", "VIEWER"));

analyticsRouter.get("/", asyncHandler(analyticsController.dashboard));
analyticsRouter.get("/overview", asyncHandler(analyticsController.overview));
analyticsRouter.get("/trend", asyncHandler(analyticsController.trend));
analyticsRouter.get("/sentiment", asyncHandler(analyticsController.sentiment));
analyticsRouter.get("/sources", asyncHandler(analyticsController.sources));
analyticsRouter.get("/categories", asyncHandler(analyticsController.categories));
analyticsRouter.get("/themes", asyncHandler(analyticsController.themes));
analyticsRouter.get("/hourly", asyncHandler(analyticsController.hourly));
analyticsRouter.get("/export", asyncHandler(analyticsController.export));

analyticsRouter.post(
  "/live-url",
  authorize("ADMIN", "ANALYST"),
  validate(createLiveUrlSchema),
  asyncHandler(analyticsController.createLiveUrl),
);

analyticsRouter.get(
  "/live/:token",
  asyncHandler(analyticsController.accessLiveUrl),
);

analyticsRouter.get(
  "/stream",
  asyncHandler(analyticsController.streamAnalytics),
);

export { analyticsRouter };
