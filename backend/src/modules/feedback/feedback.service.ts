import { prisma } from "../../config/database.js";

import { ApiError } from "../../utils/apiError.js";

import { FEEDBACK_MESSAGES } from "./feedback.constants.js";

import { FeedbackRepository } from "./feedback.repository.js";

import type {
  CreateFeedbackInput,
  FeedbackActorContext,
  FeedbackListFilters,
} from "./feedback.types.js";



const feedbackRepository = new FeedbackRepository(prisma);

export const feedbackService = {
  async create(
    context: FeedbackActorContext,
    input: CreateFeedbackInput,
  ) {
    const content = input.content.trim();

    if (!content) {
      throw new ApiError(
        400,
        FEEDBACK_MESSAGES.contentRequired,
      );
    }

    if (!input.source) {
      throw new ApiError(
        400,
        FEEDBACK_MESSAGES.sourceRequired,
      );
    }

    let feedbackDate: Date | undefined;

    if (input.feedbackDate) {
      feedbackDate = new Date(input.feedbackDate);

      if (Number.isNaN(feedbackDate.getTime())) {
        throw new ApiError(
          400,
          "Invalid feedback date.",
        );
      }
    }

    const feedback = await feedbackRepository.create({
      content,

      customerName:
        input.customerName?.trim() || undefined,

      source: input.source,

      category:
        input.category?.trim() || undefined,

      feedbackDate,

      workspace: {
        connect: {
          id: context.workspaceId,
        },
      },

      createdBy: {
        connect: {
          id: context.userId,
        },
      },
    });

    return feedback;
  },

  async list(
    context: FeedbackActorContext,
    filters: FeedbackListFilters,
  ) {
    return feedbackRepository.list(
      context.workspaceId,
      {
        page: Number(filters.page ?? 1),
        limit: Number(filters.limit ?? 20),
        search: filters.search,
        source: filters.source,
        status: filters.status,
        sentiment: filters.sentiment,
        category: filters.category,
      },
    );
  },

  async getById(
    context: FeedbackActorContext,
    id: string,
  ) {
    const feedback =
      await feedbackRepository.findById(
        id,
        context.workspaceId,
      );

    if (!feedback) {
      throw new ApiError(
        404,
        FEEDBACK_MESSAGES.notFound,
      );
    }

    return feedback;
  },

  async remove(
    context: FeedbackActorContext,
    id: string,
  ) {
    const existing =
      await feedbackRepository.findById(
        id,
        context.workspaceId,
      );

    if (!existing) {
      throw new ApiError(
        404,
        FEEDBACK_MESSAGES.notFound,
      );
    }

    await feedbackRepository.delete(
      id,
      context.workspaceId,
    );

    return {
      id,
      deleted: true,
    };
  },
};