import { z } from "zod";

import { EXPORT_LIMITS } from "./export.constants.js";

const exportFormatSchema = z.enum(["CSV", "XLSX", "JSON", "PDF"]);

export const createExportSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(
        EXPORT_LIMITS.MAX_NAME_LENGTH,
        `Name cannot exceed ${EXPORT_LIMITS.MAX_NAME_LENGTH} characters`,
      ),

    format: exportFormatSchema,

    type: z.enum(["feedback", "analytics", "themes", "reports"]),

    filters: z.record(z.string(), z.unknown()).optional(),

    dateRange: z
      .object({
        start: z.string().datetime({ offset: true }),
        end: z.string().datetime({ offset: true }),
      })
      .optional(),
  }),
});

export const exportIdSchema = z.object({
  params: z.object({
    exportId: z.string().trim().min(1, "Export ID is required"),
  }),
});

export const listExportSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(EXPORT_LIMITS.DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(EXPORT_LIMITS.MAX_LIMIT)
      .default(EXPORT_LIMITS.DEFAULT_LIMIT),

    search: z.string().trim().min(1).max(200).optional(),

    format: exportFormatSchema.optional(),

    status: z
      .enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"])
      .optional(),

    type: z.string().trim().max(50).optional(),

    sortBy: z.enum(["createdAt", "updatedAt", "name", "status"] as [string, ...string[]]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"] as [string, ...string[]]).default("desc"),
  }),
});
