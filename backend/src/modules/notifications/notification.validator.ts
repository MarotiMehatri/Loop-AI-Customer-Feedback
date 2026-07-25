import { z } from "zod";

import {
  NotificationPriority,
  NotificationType,
} from "../../generated/prisma/client.js";

import {
  NOTIFICATION_DEFAULT_LIMIT,
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_MAX_LIMIT,
  NOTIFICATION_MAX_SEARCH_LENGTH,
} from "./notification.constants.js";

const queryBooleanSchema = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true");

const queryDateSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

const notificationListQuery = z
  .object({
    page: z.coerce.number().int().min(1).default(NOTIFICATION_DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(NOTIFICATION_MAX_LIMIT)
      .default(NOTIFICATION_DEFAULT_LIMIT),

    search: z
      .string()
      .trim()
      .min(1)
      .max(NOTIFICATION_MAX_SEARCH_LENGTH)
      .optional(),

    type: z.nativeEnum(NotificationType).optional(),

    priority: z.nativeEnum(NotificationPriority).optional(),

    isRead: queryBooleanSchema.optional(),

    startDate: queryDateSchema.optional(),

    endDate: queryDateSchema.optional(),

    sortBy: z.enum(["createdAt", "priority", "title"]).default("createdAt"),

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
  });

export const listNotificationsSchema = z.object({
  query: notificationListQuery,
});

export const notificationIdSchema = z.object({
  params: z.object({
    notificationId: z.string().trim().min(1).max(100),
  }),
});

export const clearNotificationsSchema = z.object({
  query: z.object({
    onlyRead: queryBooleanSchema.optional(),

    beforeDate: queryDateSchema.optional(),
  }),
});
