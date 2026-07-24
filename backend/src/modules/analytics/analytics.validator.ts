import { z } from "zod";
import {
  ANALYTICS_DEFAULT_DAYS,
  ANALYTICS_DEFAULT_GROUP_BY,
  ANALYTICS_MAX_DAYS,
} from "./analytics.constants.js";
import { endOfDay, startOfDay } from "./analytics.helper.js";

export const analyticsQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    days: z.coerce
      .number()
      .int()
      .min(1)
      .max(ANALYTICS_MAX_DAYS)
      .default(ANALYTICS_DEFAULT_DAYS),
    groupBy: z
      .enum(["day", "week", "month"])
      .default(ANALYTICS_DEFAULT_GROUP_BY),
    source: z
      .enum([
        "SUPPORT",
        "APP_STORE",
        "SURVEY",
        "SALES",
        "SOCIAL",
        "WEBSITE",
        "EMAIL",
        "MANUAL",
      ])
      .optional(),
    sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).optional(),
    status: z.enum(["NEW", "REVIEWED", "ACTIONED", "ARCHIVED"]).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    themeId: z.string().cuid().optional(),
  })
  .transform((value) => {
    const endDate = endOfDay(value.endDate ?? new Date());
    const fallbackStart = new Date(endDate);
    fallbackStart.setDate(fallbackStart.getDate() - value.days + 1);
    const startDate = startOfDay(value.startDate ?? fallbackStart);
    if (startDate > endDate)
      throw new Error("startDate cannot be after endDate");
    return {
      startDate,
      endDate,
      groupBy: value.groupBy,
      source: value.source,
      sentiment: value.sentiment,
      status: value.status,
      category: value.category,
      themeId: value.themeId,
    };
  });

export const analyticsExportSchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
});
