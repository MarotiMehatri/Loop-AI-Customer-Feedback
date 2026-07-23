import { z } from "zod";

export const askQuestionSchema = z.object({
  question: z.string().min(5).max(500),
  context: z.string().max(1000).optional(),
  themeId: z.string().optional(),
});

export const askQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

export type AskQuestionInput = z.infer<typeof askQuestionSchema>;
