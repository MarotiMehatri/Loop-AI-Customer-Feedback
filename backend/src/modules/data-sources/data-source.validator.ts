import { z } from "zod";

import {
  DATA_SOURCE_LIMITS,
  DATA_SOURCE_SORT_FIELDS,
  DATA_SOURCE_SORT_ORDERS,
} from "./data-source.constants.js";

const dataSourceTypeSchema = z.enum([
  "API",
  "WEBHOOK",
  "CSV",
  "DATABASE",
  "EMAIL",
  "SOCIAL_MEDIA",
  "CUSTOM",
]);

export const createDataSourceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(
        DATA_SOURCE_LIMITS.MAX_NAME_LENGTH,
        `Name cannot exceed ${DATA_SOURCE_LIMITS.MAX_NAME_LENGTH} characters`,
      ),

    type: dataSourceTypeSchema,

    description: z
      .string()
      .trim()
      .max(
        DATA_SOURCE_LIMITS.MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${DATA_SOURCE_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
      )
      .optional(),

    config: z.record(z.string(), z.unknown()).default({}),

    isActive: z.boolean().default(true),
  }),
});

export const dataSourceIdSchema = z.object({
  params: z.object({
    dataSourceId: z.string().trim().min(1, "Data source ID is required"),
  }),
});

export const updateDataSourceSchema = z.object({
  params: z.object({
    dataSourceId: z.string().trim().min(1, "Data source ID is required"),
  }),

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .max(
          DATA_SOURCE_LIMITS.MAX_NAME_LENGTH,
          `Name cannot exceed ${DATA_SOURCE_LIMITS.MAX_NAME_LENGTH} characters`,
        )
        .optional(),

      type: dataSourceTypeSchema.optional(),

      description: z
        .union([
          z
            .string()
            .trim()
            .max(
              DATA_SOURCE_LIMITS.MAX_DESCRIPTION_LENGTH,
              `Description cannot exceed ${DATA_SOURCE_LIMITS.MAX_DESCRIPTION_LENGTH} characters`,
            ),
          z.null(),
          z.literal(""),
        ])
        .optional()
        .transform((value) => (value === "" ? null : value)),

      config: z.record(z.string(), z.unknown()).optional(),

      isActive: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const listDataSourceSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(DATA_SOURCE_LIMITS.DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(DATA_SOURCE_LIMITS.MAX_LIMIT)
      .default(DATA_SOURCE_LIMITS.DEFAULT_LIMIT),

    search: z.string().trim().min(1).max(200).optional(),

    type: dataSourceTypeSchema.optional(),

    status: z.enum(["ACTIVE", "INACTIVE", "ERROR", "SYNCING"]).optional(),

    sortBy: z.enum(["createdAt", "updatedAt", "name", "type", "status"] as [string, ...string[]]).default("createdAt"),

    sortOrder: z.enum(["asc", "desc"] as [string, ...string[]]).default("desc"),
  }),
});
