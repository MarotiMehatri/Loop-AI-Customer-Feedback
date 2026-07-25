import { z } from "zod";

import {
  REPORT_MAX_DESCRIPTION_LENGTH,
  REPORT_MAX_LIMIT,
  REPORT_MAX_TAGS,
  REPORT_MAX_TITLE_LENGTH,
} from "./report.constants.js";

import {
  REPORT_CHART_TYPES,
  REPORT_EXPORT_FORMATS,
  REPORT_METRICS,
  REPORT_SOURCES,
  REPORT_TYPES,
} from "./report.types.js";

const dateStringSchema = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

const optionalDateSchema = dateStringSchema.optional();

const nullableDateSchema = z.union([dateStringSchema, z.null()]).optional();

const reportFiltersSchema = z
  .object({
    sentiments: z.array(z.string().trim().min(1)).optional(),

    channels: z.array(z.string().trim().min(1)).optional(),

    statuses: z.array(z.string().trim().min(1)).optional(),

    themeIds: z.array(z.string().trim().min(1)).optional(),

    search: z.string().trim().max(200).optional(),
  })
  .strict();

const chartSchema = z
  .object({
    type: z.enum(REPORT_CHART_TYPES),

    metric: z.enum(REPORT_METRICS),

    title: z.string().trim().max(150).optional(),
  })
  .strict();

export const createReportSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2).max(REPORT_MAX_TITLE_LENGTH),

      description: z
        .string()
        .trim()
        .max(REPORT_MAX_DESCRIPTION_LENGTH)
        .optional(),

      type: z.enum(REPORT_TYPES),

      startDate: optionalDateSchema,

      endDate: optionalDateSchema,

      sources: z.array(z.enum(REPORT_SOURCES)).min(1),

      filters: reportFiltersSchema.optional(),

      metrics: z.array(z.enum(REPORT_METRICS)).min(1),

      charts: z.array(chartSchema).optional(),

      tags: z
        .array(z.string().trim().min(1).max(50))
        .max(REPORT_MAX_TAGS)
        .default([]),

      saveAsTemplate: z.boolean().default(false),
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

export const updateReportSchema = z.object({
  params: z.object({
    reportId: z.string().cuid(),
  }),

  body: z
    .object({
      title: z.string().trim().min(2).max(REPORT_MAX_TITLE_LENGTH).optional(),

      description: z
        .union([z.string().trim().max(REPORT_MAX_DESCRIPTION_LENGTH), z.null()])
        .optional(),

      type: z.enum(REPORT_TYPES).optional(),

      status: z
        .enum(["DRAFT", "GENERATING", "COMPLETED", "FAILED", "SCHEDULED"])
        .optional(),

      startDate: nullableDateSchema,

      endDate: nullableDateSchema,

      sources: z.array(z.enum(REPORT_SOURCES)).min(1).optional(),

      filters: reportFiltersSchema.optional(),

      metrics: z.array(z.enum(REPORT_METRICS)).min(1).optional(),

      charts: z.array(chartSchema).optional(),

      tags: z
        .array(z.string().trim().min(1).max(50))
        .max(REPORT_MAX_TAGS)
        .optional(),

      scheduledAt: nullableDateSchema,
    })
    .strict(),
});

export const reportIdSchema = z.object({
  params: z.object({
    reportId: z.string().cuid(),
  }),
});

export const listReportsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(REPORT_MAX_LIMIT).default(10),

    search: z.string().trim().max(200).optional(),

    type: z.string().trim().optional(),

    status: z
      .enum(["DRAFT", "GENERATING", "COMPLETED", "FAILED", "SCHEDULED"])
      .optional(),

    startDate: optionalDateSchema,

    endDate: optionalDateSchema,

    sortBy: z
      .enum(["createdAt", "updatedAt", "title", "status"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const previewReportSchema = z.object({
  body: z
    .object({
      startDate: optionalDateSchema,

      endDate: optionalDateSchema,

      sources: z.array(z.enum(REPORT_SOURCES)).min(1),

      filters: reportFiltersSchema.optional(),

      metrics: z.array(z.enum(REPORT_METRICS)).min(1),

      charts: z.array(chartSchema).optional(),
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

export const exportReportSchema = z.object({
  params: z.object({
    reportId: z.string().cuid(),
  }),

  query: z.object({
    format: z.enum(REPORT_EXPORT_FORMATS).default("CSV"),
  }),
});

export const scheduleReportSchema = z.object({
  params: z.object({
    reportId: z.string().cuid(),
  }),

  body: z.object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),

    scheduledAt: optionalDateSchema,
  }),
});
