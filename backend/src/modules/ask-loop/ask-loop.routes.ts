import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { workspaceMiddleware } from "../../middleware/workspace.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import { askLoopController } from "./ask-loop.controller.js";

import {
  askLoopQuestionSchema,
  conversationIdSchema,
  conversationListSchema,
  messageFeedbackSchema,
  savedQuerySchema,
  savedQueryParamsSchema,
} from "./ask-loop.validator.js";

export const askLoopRouter = Router();

askLoopRouter.use(authenticate);
askLoopRouter.use(workspaceMiddleware);

askLoopRouter.get(
  "/suggestions",
  asyncHandler(askLoopController.suggestions),
);

askLoopRouter.get(
  "/conversations",
  validate(conversationListSchema),
  asyncHandler(askLoopController.listConversations),
);

askLoopRouter.get(
  "/conversations/:conversationId",
  validate(conversationIdSchema),
  asyncHandler(askLoopController.getConversation),
);

askLoopRouter.delete(
  "/conversations/:conversationId",
  authorize("ADMIN", "ANALYST"),
  validate(conversationIdSchema),
  asyncHandler(askLoopController.deleteConversation),
);

askLoopRouter.post(
  "/messages/:messageId/feedback",
  validate(messageFeedbackSchema),
  asyncHandler(askLoopController.messageFeedback),
);

askLoopRouter.post(
  "/ask",
  validate(askLoopQuestionSchema),
  asyncHandler(askLoopController.ask),
);

askLoopRouter.get(
  "/saved-queries",
  asyncHandler(askLoopController.listSavedQueries),
);

askLoopRouter.post(
  "/saved-queries",
  authorize("ADMIN", "ANALYST"),
  validate(savedQuerySchema),
  asyncHandler(askLoopController.saveQuery),
);

askLoopRouter.delete(
  "/saved-queries/:savedQueryId",
  authorize("ADMIN", "ANALYST"),
  validate(savedQueryParamsSchema),
  asyncHandler(askLoopController.deleteSavedQuery),
);
