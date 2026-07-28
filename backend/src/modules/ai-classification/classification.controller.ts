import type { Request, RequestHandler } from "express";

import { ApiError } from "../../utils/apiError.js";
import { CLASSIFICATION_MESSAGES } from "./classification.constants.js";
import { classificationService } from "./classification.service.js";
import type { ClassificationActorContext, ListClassificationsQuery } from "./classification.types.js";

function getClassificationContext(request: Request): ClassificationActorContext {
  const userId = request.user?.userId;
  const workspaceId = request.workspaceId ?? request.user?.workspaceId;
  const role = request.user?.role;

  if (!userId || !role) {
    throw new ApiError(401, CLASSIFICATION_MESSAGES.authenticationRequired);
  }

  if (!workspaceId) {
    throw new ApiError(400, CLASSIFICATION_MESSAGES.workspaceRequired);
  }

  return { userId, workspaceId, role };
}

export const classificationController: {
  classify: RequestHandler;
  classifyBatch: RequestHandler;
  classifyFeedbackById: RequestHandler;
  list: RequestHandler;
} = {
  classify: async (request, response, next) => {
    try {
      const actor = getClassificationContext(request);

      const result = await classificationService.classify(
        actor,
        request.body as never,
      );

      response.status(200).json({
        success: true,
        message: CLASSIFICATION_MESSAGES.classified,
        data: { classification: result },
      });
    } catch (error) {
      next(error);
    }
  },

  classifyBatch: async (request, response, next) => {
    try {
      const actor = getClassificationContext(request);

      const result = await classificationService.classifyBatch(
        actor,
        request.body as never,
      );

      response.status(200).json({
        success: true,
        message: CLASSIFICATION_MESSAGES.batchClassified,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  classifyFeedbackById: async (request, response, next) => {
    try {
      const actor = getClassificationContext(request);

      const result = await classificationService.classifyFeedbackById(
        actor,
        request.params.feedbackId as string,
      );

      response.status(200).json({
        success: true,
        message: CLASSIFICATION_MESSAGES.classified,
        data: { classification: result },
      });
    } catch (error) {
      next(error);
    }
  },

  list: async (request, response, next) => {
    try {
      const actor = getClassificationContext(request);

      const result = await classificationService.list(
        actor,
        request.query as unknown as ListClassificationsQuery,
      );

      response.status(200).json({
        success: true,
        message: CLASSIFICATION_MESSAGES.listed,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
