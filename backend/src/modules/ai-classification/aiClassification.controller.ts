import type { Request, Response } from "express";

import { ApiError } from "../../utils/apiError.js";

import {
  classifyFeedback,
  classifyFeedbackBatch,
} from "./aiClassification.service.js";

import type {
  ClassifyBatchInput,
  ClassifyFeedbackInput,
} from "./aiClassification.types.js";

const getAuthenticatedUser = (request: Request) => {
  if (!request.user) {
    throw new ApiError(401, "Authentication is required");
  }

  return request.user;
};

/**
 * POST /api/v1/ai-classification/classify
 */
export const classifyFeedbackController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const result = await classifyFeedback(
    request.body as ClassifyFeedbackInput,
  );

  response.status(200).json({
    success: true,
    message: "Feedback classified successfully",
    data: {
      classification: result,
    },
  });
};

/**
 * POST /api/v1/ai-classification/classify-batch
 */
export const classifyFeedbackBatchController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(request);

  const result = await classifyFeedbackBatch(
    request.body as ClassifyBatchInput,
  );

  response.status(200).json({
    success: true,
    message: "Batch classification completed",
    data: result,
  });
};
