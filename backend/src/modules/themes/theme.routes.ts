import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { themeController } from "./theme.controller.js";

import {
  assignFeedbackSchema,
  createThemeSchema,
  generateThemesSchema,
  listThemeFeedbackSchema,
  listThemesSchema,
  removeFeedbackSchema,
  themeIdSchema,
  updateThemeSchema,
} from "./theme.validator.js";

const themeRouter = Router();

/*
 * Static routes must be registered before /:themeId.
 */

themeRouter.get("/summary", themeController.summary);

themeRouter.post(
  "/generate",
  validate(generateThemesSchema),
  themeController.generate,
);

themeRouter.get("/", validate(listThemesSchema), themeController.list);

themeRouter.post("/", validate(createThemeSchema), themeController.create);

themeRouter.get(
  "/:themeId/analytics",
  validate(themeIdSchema),
  themeController.analytics,
);

themeRouter.get(
  "/:themeId/feedback",
  validate(listThemeFeedbackSchema),
  themeController.listFeedback,
);

themeRouter.post(
  "/:themeId/feedback/:feedbackId",
  validate(assignFeedbackSchema),
  themeController.assignFeedback,
);

themeRouter.delete(
  "/:themeId/feedback/:feedbackId",
  validate(removeFeedbackSchema),
  themeController.removeFeedback,
);

themeRouter.get("/:themeId", validate(themeIdSchema), themeController.getById);

themeRouter.patch(
  "/:themeId",
  validate(updateThemeSchema),
  themeController.update,
);

themeRouter.delete(
  "/:themeId",
  validate(themeIdSchema),
  themeController.remove,
);

export default themeRouter;
