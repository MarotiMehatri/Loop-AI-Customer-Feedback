import { Router } from "express";

import { askLoopController } from "./askLoop.controller.js";

import { authenticate } from "../../middleware/authenticate.middleware.js";

import { workspaceMiddleware } from "../../middleware/workspace.middleware.js";

export const askLoopRouter = Router();

askLoopRouter.use(authenticate);

askLoopRouter.use(workspaceMiddleware);

askLoopRouter.get("/suggestions", askLoopController.suggestions);

askLoopRouter.get("/conversations", askLoopController.listConversations);

askLoopRouter.get(
  "/conversations/:conversationId",
  askLoopController.getConversation,
);

askLoopRouter.delete(
  "/conversations/:conversationId",
  askLoopController.deleteConversation,
);

askLoopRouter.post(
  "/messages/:messageId/feedback",
  askLoopController.messageFeedback,
);

askLoopRouter.post("/ask", askLoopController.ask);
