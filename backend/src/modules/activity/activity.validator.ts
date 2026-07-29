import { z } from "zod";

import { ActivityType } from "../../generated/prisma/client.js";

import {
  ACTIVITY_DEFAULT_LIMIT,
  ACTIVITY_DEFAULT_PAGE,
  ACTIVITY_DEFAULT_RECENT_LIMIT,
  ACTIVITY_MAX_LIMIT,
  ACTIVITY_MAX_RECENT_LIMIT,
  ACTIVITY_MAX_SEARCH_LENGTH,
} from "./activity.constants.js";

const dateSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

const optionalDateSchema = dateSchema.optional();

export const listActivitySchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(ACTIVITY_DEFAULT_PAGE),

      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(ACTIVITY_MAX_LIMIT)
        .default(ACTIVITY_DEFAULT_LIMIT),

      search: z.string().trim().max(ACTIVITY_MAX_SEARCH_LENGTH).optional(),

      type: z.nativeEnum(ActivityType).optional(),

      userId: z.string().cuid().optional(),

      startDate: optionalDateSchema,

      endDate: optionalDateSchema,

      sortBy: z.enum(["createdAt", "title"]).default("createdAt"),

      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
    .superRefine((value, context) => {
      if (value.startDate && value.endDate && value.startDate > value.endDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "End date must be after start date",
        });
      }
    }),
});

export const recentActivitySchema = z.object({
  query: z.object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(ACTIVITY_MAX_RECENT_LIMIT)
      .default(ACTIVITY_DEFAULT_RECENT_LIMIT),

    type: z.nativeEnum(ActivityType).optional(),

    userId: z.string().cuid().optional(),
  }),
});

export const activitySummarySchema = z.object({
  query: z.object({
    userId: z.string().cuid().optional(),
  }),
});

export const activityIdSchema = z.object({
  params: z.object({
    activityId: z.string().cuid(),
  }),
});

export const clearActivitySchema = z.object({
  body: z
    .object({
      beforeDate: optionalDateSchema,

      userId: z.string().cuid().optional(),
    })
    .strict(),
});
