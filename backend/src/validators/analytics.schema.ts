import { z } from "zod";

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  courierId: z.string().uuid().optional(),
  status: z.string().optional(),
  region: z.string().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const comparisonSchema = z.object({
  currentStart: z.string().datetime(),
  currentEnd: z.string().datetime(),
  previousStart: z.string().datetime(),
  previousEnd: z.string().datetime(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type ComparisonInput = z.infer<typeof comparisonSchema>;
