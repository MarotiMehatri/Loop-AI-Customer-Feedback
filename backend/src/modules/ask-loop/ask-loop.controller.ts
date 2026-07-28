import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";
import { ASK_LOOP_MESSAGES } from "./ask-loop.constants.js";
import { askLoopService } from "./ask-loop.service.js";
import type { AskLoopActorContext } from "./ask-loop.types.js";

function getAskLoopContext(request: Request): AskLoopActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, ASK_LOOP_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, ASK_LOOP_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

export const askLoopController: {
  ask: RequestHandler;
  getConversation: RequestHandler;
  listConversations: RequestHandler;
  deleteConversation: RequestHandler;
  suggestions: RequestHandler;
  messageFeedback: RequestHandler;
  saveQuery: RequestHandler;
  listSavedQueries: RequestHandler;
  deleteSavedQuery: RequestHandler;
} = {
  ask: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      const data = await askLoopService.ask(actor, {
        question: request.body.question,
        conversationId: request.body.conversationId,
        startDate: request.body.startDate,
        endDate: request.body.endDate,
      });

      response.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  getConversation: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      const data = await askLoopService.getConversation(
        actor,
        request.params.conversationId as string,
      );

      response.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  listConversations: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 20;

      const data = await askLoopService.listConversations(actor, page, limit);

      response.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteConversation: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      await askLoopService.deleteConversation(
        actor,
        request.params.conversationId as string,
      );

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  suggestions: async (_request, response, next) => {
    try {
      response.json({
        success: true,
        data: askLoopService.getSuggestions(),
      });
    } catch (error) {
      next(error);
    }
  },

  messageFeedback: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      const data = await askLoopService.saveMessageFeedback(actor, {
        messageId: request.params.messageId as string,
        helpful: request.body.helpful,
        note: request.body.note,
      });

      response.json({
        success: true,
        message: ASK_LOOP_MESSAGES.feedbackSaved,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  saveQuery: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      const data = await askLoopService.saveQuery(actor, {
        question: request.body.question,
        label: request.body.label,
      });

      response.status(201).json({
        success: true,
        message: ASK_LOOP_MESSAGES.savedQueryCreated,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  listSavedQueries: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      const data = await askLoopService.listSavedQueries(actor);

      response.json({
        success: true,
        message: ASK_LOOP_MESSAGES.savedQueryListed,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteSavedQuery: async (request, response, next) => {
    try {
      const actor = getAskLoopContext(request);

      await askLoopService.deleteSavedQuery(
        actor,
        request.params.savedQueryId as string,
      );

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
