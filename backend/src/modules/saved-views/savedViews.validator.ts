import { z } from "zod";

import {
  SAVED_VIEW_LIMITS,
  SAVED_VIEW_SORT_FIELDS,
  SAVED_VIEW_SORT_ORDERS,
} from "./savedViews.constants.js";

export const createSavedViewSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(
        SAVED_VIEW_LIMITS.MAX_NAME_LENGTH,
        `Name cannot exceed ${SAVED_VIEW_LIMITS.MAX_NAME_LENGTH} characters`,
      ),

    filters: z.record(z.string(), z.unknown()),

    description: z
      .string()
      .trim()
      .max(
        SAVED_VIEW_LIMITS.MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${SAVED_VIEW_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
      )
      .optional(),

    isDefault: z.boolean().default(false),
  }),
});

export const savedViewIdSchema = z.object({
  params: z.object({
    viewId: z.string().trim().min(1, "View ID is required"),
  }),
});

export const updateSavedViewSchema = z.object({
  params: z.object({
    viewId: z.string().trim().min(1, "View ID is required"),
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .max(
          SAVED_VIEW_LIMITS.MAX_NAME_LENGTH,
          `Name cannot exceed ${SAVED_VIEW_LIMITS.MAX_NAME_LENGTH} characters`,
        )
        .optional(),

      filters: z.record(z.string(), z.unknown()).optional(),

      description: z
        .union([
          z
            .string()
            .trim()
            .max(
              SAVED_VIEW_LIMITS.MAX_DESCRIPTION_LENGTH,
              `Description cannot exceed ${SAVED_VIEW_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
            ),
          z.null(),
          z.literal(""),
        ])
        .optional()
        .transform((value) => (value === "" ? null : value)),

      isDefault: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const listSavedViewSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(SAVED_VIEW_LIMITS.DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(SAVED_VIEW_LIMITS.MAX_LIMIT)
      .default(SAVED_VIEW_LIMITS.DEFAULT_LIMIT),

    search: z.string().trim().min(1).max(200).optional(),

    sortBy: z.enum(["createdAt", "updatedAt", "name"] as [string, ...string[]]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"] as [string, ...string[]]).default("desc"),
  }),
});
