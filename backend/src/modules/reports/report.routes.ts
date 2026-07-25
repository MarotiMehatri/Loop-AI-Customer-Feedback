import { Router } from "express";

import { validate } from "../../middleware/validate.middleware.js";

import { reportController } from "./report.controller.js";

import {
  createReportSchema,
  exportReportSchema,
  listReportsSchema,
  previewReportSchema,
  reportIdSchema,
  scheduleReportSchema,
  updateReportSchema,
} from "./report.validator.js";

const reportRouter = Router();

reportRouter.get("/summary", reportController.summary);

reportRouter.get("/recent", reportController.recent);

reportRouter.post(
  "/preview",
  validate(previewReportSchema),
  reportController.preview,
);

reportRouter.get("/", validate(listReportsSchema), reportController.list);

reportRouter.post("/", validate(createReportSchema), reportController.create);

reportRouter.get(
  "/:reportId",
  validate(reportIdSchema),
  reportController.getById,
);

reportRouter.patch(
  "/:reportId",
  validate(updateReportSchema),
  reportController.update,
);

reportRouter.delete(
  "/:reportId",
  validate(reportIdSchema),
  reportController.delete,
);

reportRouter.post(
  "/:reportId/generate",
  validate(reportIdSchema),
  reportController.generate,
);

reportRouter.get(
  "/:reportId/export",
  validate(exportReportSchema),
  reportController.export,
);

reportRouter.post(
  "/:reportId/schedule",
  validate(scheduleReportSchema),
  reportController.schedule,
);

export default reportRouter;
