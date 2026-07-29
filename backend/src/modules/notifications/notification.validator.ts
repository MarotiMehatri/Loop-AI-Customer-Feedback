import { z } from "zod";

import {
  NOTIFICATION_DEFAULT_LIMIT,
  NOTIFICATION_DEFAULT_PAGE,
  NOTIFICATION_MAX_LIMIT,
} from "./notification.constants.js";

const optionalBooleanQuery = z.preprocess(
  (value) => {
    if (value === undefined || value === "") {
      return undefined;
    }

    if (value === true || value === "true") {
      return true;
    }

    if (value === false || value === "false") {
      return false;
    }

    return value;
  },

  z.boolean().optional(),
);

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(NOTIFICATION_DEFAULT_PAGE),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(NOTIFICATION_MAX_LIMIT)
    .default(NOTIFICATION_DEFAULT_LIMIT),

  isRead: optionalBooleanQuery,

  type: z.string().trim().min(1).optional(),
});

export const notificationParamsSchema = z.object({
  notificationId: z.string().trim().min(1),
});
