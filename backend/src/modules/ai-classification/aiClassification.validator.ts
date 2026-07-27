import { z } from "zod";

const classifyFeedbackSchemaBody = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(10000, "Content cannot exceed 10000 characters"),

  source: z.string().trim().max(100).optional(),

  customerName: z.string().trim().max(100).optional(),
});

const classifyItemSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(10000, "Content cannot exceed 10000 characters"),

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
      .max(50, "Batch size cannot exceed 50 items"),
  }),
});
