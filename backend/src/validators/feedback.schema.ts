import { z } from "zod";

const feedbackChannelEnum = z.enum(["APP_STORE", "SURVEY", "SUPPORT", "EMAIL", "SOCIAL", "DIRECT", "API"]);
const feedbackStatusEnum = z.enum(["NEW", "REVIEWED", "ACTIONED", "ARCHIVED"]);
const sentimentEnum = z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]);

export const createFeedbackSchema = z.object({
  content: z.string().min(1).max(5000),
  channel: feedbackChannelEnum.optional(),
  sentiment: sentimentEnum.optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  customerName: z.string().max(200).optional(),
  customerEmail: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
  themeId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateFeedbackSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  channel: feedbackChannelEnum.optional(),
  sentiment: sentimentEnum.optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
  customerName: z.string().max(200).optional(),
  customerEmail: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
  themeId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const changeStatusSchema = z.object({
  status: feedbackStatusEnum,
});

export const importFeedbackSchema = z.object({
  items: z.array(createFeedbackSchema).min(1).max(1000),
});

export const feedbackQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: feedbackStatusEnum.optional(),
  sentiment: sentimentEnum.optional(),
  channel: feedbackChannelEnum.optional(),
  themeId: z.string().optional(),
  search: z.string().optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ImportFeedbackInput = z.infer<typeof importFeedbackSchema>;
export type FeedbackQueryInput = z.infer<typeof feedbackQuerySchema>;
