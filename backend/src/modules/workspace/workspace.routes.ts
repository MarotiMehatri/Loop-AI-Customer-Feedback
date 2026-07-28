import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { workspaceController } from "./workspace.controller.js";
import {
  deleteWorkspaceSchema,
  updateWorkspaceSchema,
} from "./workspace.validator.js";

const workspaceRouter = Router();

workspaceRouter.get("/summary", workspaceController.summary);
workspaceRouter.get("/", workspaceController.get);
workspaceRouter.patch(
  "/",
  validate(updateWorkspaceSchema),
  workspaceController.update,
);
workspaceRouter.delete(
  "/",
  validate(deleteWorkspaceSchema),
  workspaceController.remove,
);

export default workspaceRouter;
