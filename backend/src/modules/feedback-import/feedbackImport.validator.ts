import { z } from "zod";

export const feedbackImportIdParamsSchema = z.object({
  params: z.object({
    importId: z.string().cuid("Invalid import ID"),
  }),
});

export const feedbackImportListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    status: z
      .enum([
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "PARTIALLY_COMPLETED",
        "FAILED",
      ])
      .optional(),
  }),
});
