import type {
  Request,
  RequestHandler,
} from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  FEEDBACK_MESSAGES,
} from "./feedback.constants.js";

import {
  feedbackService,
} from "./feedback.service.js";

import type {
  CreateFeedbackInput,
  FeedbackActorContext,
  FeedbackListFilters,
} from "./feedback.types.js";

/* -------------------------------------------------------------------------- */
/* Actor Context                                                             */
/* -------------------------------------------------------------------------- */

function getActorContext(
  request: Request,
): FeedbackActorContext {
  const userId =
    request.user?.userId;

  const workspaceId =
    request.workspaceId ??
    request.user?.workspaceId;

  const role =
    request.user?.role;

  if (!userId || !role) {
    throw new ApiError(
      401,
      FEEDBACK_MESSAGES.authenticationRequired,
    );
  }

  if (!workspaceId) {
    throw new ApiError(
      400,
      FEEDBACK_MESSAGES.workspaceRequired,
    );
  }

  return {
    userId,
    workspaceId,
    role,
  };
}

/* -------------------------------------------------------------------------- */
/* Feedback ID                                                               */
/* -------------------------------------------------------------------------- */

function getFeedbackId(
  request: Request,
): string {
  const feedbackId =
    request.params.feedbackId;

  if (!feedbackId) {
    throw new ApiError(
      400,
      "Feedback ID is required.",
    );
  }

  return feedbackId;
}

/* -------------------------------------------------------------------------- */
/* Controller                                                                */
/* -------------------------------------------------------------------------- */

export const feedbackController: {
  create: RequestHandler;
  list: RequestHandler;
  getById: RequestHandler;
  remove: RequestHandler;
} = {
  /* ------------------------------------------------------------------------ */
  /* CREATE FEEDBACK                                                         */
  /* ------------------------------------------------------------------------ */

  create: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const input =
        request.body as CreateFeedbackInput;

      const result =
        await feedbackService.create(
          context,
          input,
        );

      return response
        .status(201)
        .json({
          success: true,
          message:
            FEEDBACK_MESSAGES.created,
          data: result,
        });
    } catch (error) {
      return next(error);
    }
  },

  /* ------------------------------------------------------------------------ */
  /* LIST FEEDBACK                                                           */
  /* ------------------------------------------------------------------------ */

  list: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const filters =
        request.query as unknown as FeedbackListFilters;

      console.log(
        "[FEEDBACK CONTROLLER] LIST",
        {
          userId: context.userId,
          workspaceId:
            context.workspaceId,
          role: context.role,
          filters,
        },
      );

      const result =
        await feedbackService.list(
          context,
          filters,
        );

      console.log(
        "[FEEDBACK CONTROLLER] RESULT",
        {
          total: result.total,
          items: result.items.length,
          page: result.page,
          limit: result.limit,
          totalPages:
            result.totalPages,
        },
      );

      return response
        .status(200)
        .json({
          success: true,
          message:
            FEEDBACK_MESSAGES.listed,
          data: result,
        });
    } catch (error) {
      return next(error);
    }
  },

  /* ------------------------------------------------------------------------ */
  /* GET FEEDBACK BY ID                                                      */
  /* ------------------------------------------------------------------------ */

  getById: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const result =
        await feedbackService.getById(
          context,
          getFeedbackId(request),
        );

      return response
        .status(200)
        .json({
          success: true,
          message:
            FEEDBACK_MESSAGES.retrieved,
          data: result,
        });
    } catch (error) {
      return next(error);
    }
  },

  /* ------------------------------------------------------------------------ */
  /* DELETE FEEDBACK                                                         */
  /* ------------------------------------------------------------------------ */

  remove: async (
    request,
    response,
    next,
  ) => {
    try {
      const context =
        getActorContext(request);

      const result =
        await feedbackService.remove(
          context,
          getFeedbackId(request),
        );

      return response
        .status(200)
        .json({
          success: true,
          message:
            FEEDBACK_MESSAGES.deleted,
          data: result,
        });
    } catch (error) {
      return next(error);
    }
  },
};