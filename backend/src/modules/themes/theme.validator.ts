import { z } from "zod";

import { ThemeStatus } from "../../generated/prisma/client.js";

import {
  THEME_DEFAULT_FEEDBACK_LIMIT,
  THEME_DEFAULT_GENERATION_LIMIT,
  THEME_DEFAULT_LIMIT,
  THEME_DEFAULT_MAX_GENERATED,
  THEME_DEFAULT_MIN_CLUSTER_SIZE,
  THEME_DEFAULT_PAGE,
  THEME_MAX_DESCRIPTION_LENGTH,
  THEME_MAX_FEEDBACK_LIMIT,
  THEME_MAX_GENERATED,
  THEME_MAX_GENERATION_LIMIT,
  THEME_MAX_LIMIT,
  THEME_MAX_NAME_LENGTH,
  THEME_MAX_SEARCH_LENGTH,
} from "./theme.constants.js";

const idSchema = z.string().trim().min(1).max(100);

const colorSchema = z
  .string()
  .trim()
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    "Color must be a valid six-digit hexadecimal value",
  );

const nullableDescriptionSchema = z
  .union([z.string().trim().max(THEME_MAX_DESCRIPTION_LENGTH), z.null()])
  .optional();

const nullableColorSchema = z.union([colorSchema, z.null()]).optional();

const queryBooleanSchema = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .transform((value) => value === true || value === "true");

export const createThemeSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(THEME_MAX_NAME_LENGTH),

      description: nullableDescriptionSchema,

      color: nullableColorSchema,

      status: z.nativeEnum(ThemeStatus).optional(),
    })
    .strict(),
});

export const updateThemeSchema = z.object({
  params: z.object({
    themeId: idSchema,
  }),

  body: z
    .object({
      name: z.string().trim().min(2).max(THEME_MAX_NAME_LENGTH).optional(),

      description: nullableDescriptionSchema,

      color: nullableColorSchema,

      status: z.nativeEnum(ThemeStatus).optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one theme field is required",
    }),
});

export const listThemesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(THEME_DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(THEME_MAX_LIMIT)
      .default(THEME_DEFAULT_LIMIT),

    search: z.string().trim().min(1).max(THEME_MAX_SEARCH_LENGTH).optional(),

    status: z.nativeEnum(ThemeStatus).optional(),

    isAiGenerated: queryBooleanSchema.optional(),

    sortBy: z
      .enum(["name", "status", "createdAt", "updatedAt"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const themeIdSchema = z.object({
  params: z.object({
    themeId: idSchema,
  }),
});

export const listThemeFeedbackSchema = z.object({
  params: z.object({
    themeId: idSchema,
  }),

  query: z.object({
    page: z.coerce.number().int().min(1).default(THEME_DEFAULT_PAGE),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(THEME_MAX_FEEDBACK_LIMIT)
      .default(THEME_DEFAULT_FEEDBACK_LIMIT),
  }),
});

export const assignFeedbackSchema = z.object({
  params: z.object({
    themeId: idSchema,
    feedbackId: idSchema,
  }),

  body: z
    .object({
      confidence: z.number().min(0).max(1).optional(),
    })
    .strict(),
});

export const removeFeedbackSchema = z.object({
  params: z.object({
    themeId: idSchema,
    feedbackId: idSchema,
  }),
});

export const generateThemesSchema = z.object({
  body: z
    .object({
      maxThemes: z
        .number()
        .int()
        .min(1)
        .max(THEME_MAX_GENERATED)
        .default(THEME_DEFAULT_MAX_GENERATED),

      minClusterSize: z
        .number()
        .int()
        .min(2)
        .max(50)
        .default(THEME_DEFAULT_MIN_CLUSTER_SIZE),

      feedbackLimit: z
        .number()
        .int()
        .min(10)
        .max(THEME_MAX_GENERATION_LIMIT)
        .default(THEME_DEFAULT_GENERATION_LIMIT),
    })
    .strict(),
});
