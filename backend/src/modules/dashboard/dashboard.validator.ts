import { z } from "zod";

import {
  DASHBOARD_DEFAULT_RANGE,
  DASHBOARD_DEFAULT_RECENT_LIMIT,
  DASHBOARD_DEFAULT_TOP_THEMES_LIMIT,
  DASHBOARD_MAX_CUSTOM_RANGE_DAYS,
  DASHBOARD_MAX_RECENT_LIMIT,
  DASHBOARD_MAX_TOP_THEMES_LIMIT,
  DASHBOARD_RANGES,
} from "./dashboard.constants.js";

const flexibleDateSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value: string) => !Number.isNaN(Date.parse(value)), "Invalid date")
  .transform((value: string) => new Date(value));

const dashboardQueryObject = z
  .object({
    range: z.enum(DASHBOARD_RANGES).default(DASHBOARD_DEFAULT_RANGE),

    startDate: flexibleDateSchema.optional(),

    endDate: flexibleDateSchema.optional(),

    recentLimit: z.coerce
      .number()
      .int()
      .min(1)
      .max(DASHBOARD_MAX_RECENT_LIMIT)
      .default(DASHBOARD_DEFAULT_RECENT_LIMIT),

    topThemesLimit: z.coerce
      .number()
      .int()
      .min(1)
      .max(DASHBOARD_MAX_TOP_THEMES_LIMIT)
      .default(DASHBOARD_DEFAULT_TOP_THEMES_LIMIT),
  })
  .superRefine(
    (
      value: {
        range: "7d" | "30d" | "90d" | "custom";
        startDate?: Date;
        endDate?: Date;
        recentLimit: number;
        topThemesLimit: number;
      },
      context,
    ) => {
      if (value.range === "custom") {
        if (!value.startDate) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["startDate"],
            message: "startDate is required for a custom range",
          });
        }

        if (!value.endDate) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: "endDate is required for a custom range",
          });
        }
      }

      if (value.startDate && value.endDate && value.startDate > value.endDate) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["endDate"],
          message: "endDate must be after startDate",
        });
      }

      if (value.startDate && value.endDate) {
        const differenceInDays =
          (value.endDate.getTime() - value.startDate.getTime()) /
          (24 * 60 * 60 * 1000);

        if (differenceInDays > DASHBOARD_MAX_CUSTOM_RANGE_DAYS) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["endDate"],
            message: `Dashboard date range cannot exceed ${DASHBOARD_MAX_CUSTOM_RANGE_DAYS} days`,
          });
        }
      }
    },
  );

export const dashboardQuerySchema = z.object({
  query: dashboardQueryObject,
});
