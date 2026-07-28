import { z } from "zod";

const optionalDateSchema = z
  .string()
  .datetime()
  .optional()
  .transform((value) =>
    value ? new Date(value) : undefined,
  );

export const askLoopQuestionSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(2, "Question must contain at least 2 characters")
      .max(2000, "Question cannot exceed 2000 characters"),

    conversationId: z.string().uuid().optional(),

    startDate: optionalDateSchema,

    endDate: optionalDateSchema,
  })
  .refine(
    (value) =>
      !value.startDate ||
      !value.endDate ||
      value.startDate.getTime() <= value.endDate.getTime(),
    {
      message: "startDate cannot be later than endDate",
      path: ["startDate"],
    },
  );

export const conversationIdSchema = z.object({
  conversationId: z.string().uuid(),
});

export const conversationListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20),
});

export const messageFeedbackSchema = z.object({
  helpful: z.boolean(),

  note: z
    .string()
    .trim()
    .max(500)
    .optional(),
});

export const savedQuerySchema = z.object({
  body: z.object({
    question: z
      .string()
      .trim()
      .min(2, "Question is required")
      .max(2000, "Question cannot exceed 2000 characters"),

    label: z.string().trim().max(200).optional(),
  }),
});

export const savedQueryUpdateSchema = z.object({
  body: z.object({
    label: z.string().trim().max(200).optional(),

    question: z
      .string()
      .trim()
      .min(2, "Question is required")
      .max(2000, "Question cannot exceed 2000 characters")
      .optional(),
  }),
});

export const savedQueryParamsSchema = z.object({
  savedQueryId: z.string().uuid(),
});
