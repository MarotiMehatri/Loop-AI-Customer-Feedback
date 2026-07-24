import type { Request, RequestHandler } from "express";

import { askLoopService } from "./askLoop.service.js";

import {
  askLoopQuestionSchema,
  conversationIdSchema,
  conversationListSchema,
  messageFeedbackSchema,
} from "./askLoop.validator.js";

function getAuthenticatedUser(req: Request) {
  if (!req.user?.userId || !req.user.workspaceId) {
    throw new Error("Authenticated user context is missing");
  }

  return {
    userId: req.user.userId,
    workspaceId: req.user.workspaceId,
  };
}

const ask: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuthenticatedUser(req);

    const body = askLoopQuestionSchema.parse(req.body);

    const data = await askLoopService.ask({
      userId: auth.userId,

      workspaceId: auth.workspaceId,

      question: body.question,

      conversationId: body.conversationId,

      startDate: body.startDate,

      endDate: body.endDate,
    });

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getConversation: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuthenticatedUser(req);

    const { conversationId } = conversationIdSchema.parse(req.params);

    const data = await askLoopService.getConversation(
      conversationId,
      auth.workspaceId,
      auth.userId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const listConversations: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuthenticatedUser(req);

    const query = conversationListSchema.parse(req.query);

    const data = await askLoopService.listConversations(
      auth.workspaceId,
      auth.userId,
      query.page,
      query.limit,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deleteConversation: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuthenticatedUser(req);

    const { conversationId } = conversationIdSchema.parse(req.params);

    await askLoopService.deleteConversation(
      conversationId,
      auth.workspaceId,
      auth.userId,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const suggestions: RequestHandler = async (_req, res, next) => {
  try {
    res.json({
      success: true,

      data: askLoopService.getSuggestions(),
    });
  } catch (error) {
    next(error);
  }
};

const messageFeedback: RequestHandler = async (req, res, next) => {
  try {
    const auth = getAuthenticatedUser(req);

    const body = messageFeedbackSchema.parse(req.body);

    const messageIdParam = req.params.messageId;

    const messageId = Array.isArray(messageIdParam)
      ? messageIdParam[0]
      : messageIdParam;

    if (!messageId) {
      throw new Error("Message ID is required");
    }

    const data = await askLoopService.saveMessageFeedback({
      messageId,
      userId: auth.userId,
      helpful: body.helpful,
      note: body.note,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const askLoopController = {
  ask,
  getConversation,
  listConversations,
  deleteConversation,
  suggestions,
  messageFeedback,
};
