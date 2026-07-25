import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { activityController } from "./activity.controller.js";

import {
  activityIdSchema,
  activitySummarySchema,
  clearActivitySchema,
  listActivitySchema,
  recentActivitySchema,
} from "./activity.validator.js";

const activityRouter = Router();

/*
 * Static routes must come before /:activityId.
 */

activityRouter.get(
  "/summary",
  validate(activitySummarySchema),
  activityController.summary,
);

activityRouter.get(
  "/recent",
  validate(recentActivitySchema),
  activityController.recent,
);

activityRouter.get(
  "/me",
  validate(listActivitySchema),
  activityController.listMine,
);

activityRouter.get("/", validate(listActivitySchema), activityController.list);

activityRouter.delete(
  "/",
  validate(clearActivitySchema),
  activityController.clear,
);

activityRouter.get(
  "/:activityId",
  validate(activityIdSchema),
  activityController.getById,
);

activityRouter.delete(
  "/:activityId",
  validate(activityIdSchema),
  activityController.remove,
);

export default activityRouter;
