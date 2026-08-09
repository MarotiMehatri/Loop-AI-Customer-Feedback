import { z } from "zod";

const feedbackChannelSchema = z.enum([
  "SUPPORT",
  "APP_STORE",
  "SURVEY",
  "SALES",
  "SOCIAL",
  "WEBSITE",
  "EMAIL",
  "MANUAL",
]);

const sentimentSchema = z.enum(["POS", "NEU", "NEG"]);

const feedbackStatusSchema = z.enum(["NEW", "REVIEWED", "ACTIONED", "ARCHIVED"]);

export const feedbackInboxListSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().max(200).optional(),

    source: feedbackChannelSchema.optional(),

    sentiment: sentimentSchema.optional(),

    status: feedbackStatusSchema.optional(),

    startDate: z.coerce.date().optional(),

    endDate: z.coerce.date().optional(),
  }),
});

export const feedbackInboxIdSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),
});

export const updateFeedbackInboxSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),

  body: z
    .object({
      content: z.string().trim().min(1).max(5000).optional(),

      customerName: z.string().trim().max(100).nullable().optional(),

      customerEmail: z.string().trim().email().nullable().optional(),

      source: feedbackChannelSchema.optional(),

      sentiment: sentimentSchema.optional(),

      status: feedbackStatusSchema.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const updateFeedbackStatusSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),

  body: z.object({
    status: feedbackStatusSchema,
  }),
});
