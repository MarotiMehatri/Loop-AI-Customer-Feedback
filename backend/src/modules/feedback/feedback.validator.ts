import { z } from "zod";

import {
  FEEDBACK_LIMITS,
  FEEDBACK_SORT_FIELDS,
  FEEDBACK_SORT_ORDERS,
} from "./feedback.constants.js";

const feedbackSourceSchema = z.enum([
  "SUPPORT",
  "APP_STORE",
  "SURVEY",
  "SALES",
  "SOCIAL",
  "WEBSITE",
  "EMAIL",
  "MANUAL",
]);

// The database stores the full enum names. Accept the older short values from
// the manual-feedback form as well, then normalize before Prisma receives them.
const sentimentSchema = z
  .enum(["POS", "NEU", "NEG", "POSITIVE", "NEUTRAL", "NEGATIVE"])
  .transform((value) => {
    if (value === "POS") return "POSITIVE";
    if (value === "NEU") return "NEUTRAL";
    if (value === "NEG") return "NEGATIVE";
    return value;
  });

const feedbackStatusSchema = z.enum([
  "NEW",
  "REVIEWED",
  "ACTIONED",
  "ARCHIVED",
]);

const customerNameSchema = z
  .string()
  .trim()
  .min(2, "Customer name must contain at least 2 characters")
  .max(
    FEEDBACK_LIMITS.MAX_CUSTOMER_NAME_LENGTH,
    `Customer name cannot exceed ${FEEDBACK_LIMITS.MAX_CUSTOMER_NAME_LENGTH} characters`,
  );

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(
    FEEDBACK_LIMITS.MAX_EMAIL_LENGTH,
    `Email cannot exceed ${FEEDBACK_LIMITS.MAX_EMAIL_LENGTH} characters`,
  )
  .email("Please provide a valid customer email");

const categorySchema = z
  .string()
  .trim()
  .min(2, "Category must contain at least 2 characters")
  .max(
    FEEDBACK_LIMITS.MAX_CATEGORY_LENGTH,
    `Category cannot exceed ${FEEDBACK_LIMITS.MAX_CATEGORY_LENGTH} characters`,
  );

const tagsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Tag cannot be empty")
      .max(
        FEEDBACK_LIMITS.MAX_TAG_LENGTH,
        `Each tag cannot exceed ${FEEDBACK_LIMITS.MAX_TAG_LENGTH} characters`,
      ),
  )
  .max(
    FEEDBACK_LIMITS.MAX_TAGS,
    `A maximum of ${FEEDBACK_LIMITS.MAX_TAGS} tags is allowed`,
  )
  .default([]);

export const createFeedbackSchema = z.object({
  body: z.object({
    source: feedbackSourceSchema,

    sentiment: sentimentSchema,

    customerName: customerNameSchema.optional(),

    customerEmail: z
      .union([emailSchema, z.literal("")])
      .optional()
      .transform((value) => value || undefined),

    content: z
      .string()
      .trim()
      .min(
        FEEDBACK_LIMITS.MIN_CONTENT_LENGTH,
        `Feedback must contain at least ${FEEDBACK_LIMITS.MIN_CONTENT_LENGTH} characters`,
      )
      .max(
        FEEDBACK_LIMITS.MAX_CONTENT_LENGTH,
        `Feedback cannot exceed ${FEEDBACK_LIMITS.MAX_CONTENT_LENGTH} characters`,
      ),

    tags: tagsSchema.optional(),

    category: z
      .union([categorySchema, z.literal("")])
      .optional()
      .transform((value) => value || undefined),

    status: feedbackStatusSchema.default("NEW"),

    isImportant: z.boolean().default(false),
  }),
});

export const feedbackIdSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),
});

export const updateFeedbackSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),

  body: z
    .object({
      source: feedbackSourceSchema.optional(),

      sentiment: sentimentSchema.optional(),

      customerName: z
        .union([customerNameSchema, z.null(), z.literal("")])
        .optional()
        .transform((value) => (value === "" ? null : value)),

      customerEmail: z
        .union([emailSchema, z.null(), z.literal("")])
        .optional()
        .transform((value) => (value === "" ? null : value)),

      content: z
        .string()
        .trim()
        .min(
          FEEDBACK_LIMITS.MIN_CONTENT_LENGTH,
          `Feedback must contain at least ${FEEDBACK_LIMITS.MIN_CONTENT_LENGTH} characters`,
        )
        .max(
          FEEDBACK_LIMITS.MAX_CONTENT_LENGTH,
          `Feedback cannot exceed ${FEEDBACK_LIMITS.MAX_CONTENT_LENGTH} characters`,
        )
        .optional(),

      tags: tagsSchema.optional(),

      category: z
        .union([categorySchema, z.null(), z.literal("")])
        .optional()
        .transform((value) => (value === "" ? null : value)),

      status: feedbackStatusSchema.optional(),

      isImportant: z.boolean().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const updateFeedbackStatusSchema = z.object({
  params: z.object({
    feedbackId: z.string().trim().min(1, "Feedback ID is required"),
  }),

  body: z.object({
    status: feedbackStatusSchema,
  }),
});

const optionalBooleanQuery = z
  .union([z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    return value === true || value === "true";
  });

const optionalDateQuery = z
  .string()
  .datetime({
    offset: true,
    message: "Date must be a valid ISO date",
  })
  .optional()
  .transform((value) => {
    return value ? new Date(value) : undefined;
  });

export const listFeedbackSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(FEEDBACK_LIMITS.DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .max(FEEDBACK_LIMITS.MAX_LIMIT)
      .default(FEEDBACK_LIMITS.DEFAULT_LIMIT),

    search: z.string().trim().min(1).max(200).optional(),

    source: feedbackSourceSchema.optional(),

    sentiment: sentimentSchema.optional(),

    status: feedbackStatusSchema.optional(),

    category: z
      .string()
      .trim()
      .max(FEEDBACK_LIMITS.MAX_CATEGORY_LENGTH)
      .optional(),

    isImportant: optionalBooleanQuery,

    createdFrom: optionalDateQuery,

    createdTo: optionalDateQuery,

    sortBy: z.enum(FEEDBACK_SORT_FIELDS).default("createdAt"),

    sortOrder: z.enum(FEEDBACK_SORT_ORDERS).default("desc"),
  }),
});
