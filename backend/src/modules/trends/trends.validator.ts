import { z } from "zod";

const trendPeriodSchema = z.enum(["day", "week", "month", "quarter"]);

const trendMetricSchema = z.enum([
  "feedback_count",
  "sentiment_distribution",
  "category_distribution",
  "source_distribution",
  "avg_sentiment_score",
]);

const optionalDateString = z
  .string()
  .datetime({ offset: true, message: "Date must be a valid ISO date" })
  .optional();

export const getTrendsSchema = z.object({
  query: z.object({
    period: trendPeriodSchema.default("month"),

    metric: trendMetricSchema.default("feedback_count"),

    startDate: optionalDateString,

    endDate: optionalDateString,

    category: z.string().trim().max(100).optional(),

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
  }),
});

export const getTrendsComparisonSchema = z.object({
  query: z.object({
    currentPeriod: trendPeriodSchema.default("month"),

    previousPeriod: trendPeriodSchema.default("month"),

    metric: trendMetricSchema.default("feedback_count"),

    startDate: optionalDateString,

    endDate: optionalDateString,
  }),
});
