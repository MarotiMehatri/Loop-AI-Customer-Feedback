import { z } from "zod";

import { CLASSIFICATION_MAX_BATCH_SIZE, CLASSIFICATION_MAX_CONTENT_LENGTH } from "./classification.constants.js";

const classifyFeedbackSchemaBody = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(CLASSIFICATION_MAX_CONTENT_LENGTH, "Content cannot exceed 10000 characters"),

  source: z.string().trim().max(100).optional(),

  customerName: z.string().trim().max(100).optional(),
});

const classifyItemSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(CLASSIFICATION_MAX_CONTENT_LENGTH, "Content cannot exceed 10000 characters"),

  source: z.string().trim().max(100).optional(),

  customerName: z.string().trim().max(100).optional(),
});

export const classifySingleSchema = z.object({
  body: classifyFeedbackSchemaBody,
});

export const classifyBatchSchema = z.object({
  body: z.object({
    items: z
      .array(classifyItemSchema)
      .min(1, "At least one item is required")
      .max(CLASSIFICATION_MAX_BATCH_SIZE, "Batch size cannot exceed 50 items"),
  }),
});

export const classifyFeedbackByIdSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),
});

export const getClassificationSchema = z.object({
  params: z.object({
    classificationId: z.string().trim().min(1, "Classification ID is required"),
  }),
});

export const listClassificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().positive().max(100).default(20),

    feedbackId: z.string().trim().optional(),

    sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).optional(),

    category: z.string().trim().max(100).optional(),

    method: z.enum(["ai", "keyword", "fallback"]).optional(),

    startDate: z
      .string()
      .datetime({ offset: true, message: "Date must be a valid ISO date" })
      .optional(),

    endDate: z
      .string()
      .datetime({ offset: true, message: "Date must be a valid ISO date" })
      .optional(),
  }),
});
