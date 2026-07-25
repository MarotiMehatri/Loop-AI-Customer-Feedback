import { z } from "zod";

import {
  PROFILE_MAX_ACTIVITY_LIMIT,
  PROFILE_MAX_BIO_LENGTH,
  PROFILE_MAX_DEPARTMENT_LENGTH,
  PROFILE_MAX_JOB_TITLE_LENGTH,
  PROFILE_MAX_LOCATION_LENGTH,
  PROFILE_MAX_NAME_LENGTH,
  PROFILE_MAX_PASSWORD_LENGTH,
  PROFILE_MAX_PHONE_LENGTH,
  PROFILE_MAX_TIMEZONE_LENGTH,
  PROFILE_MIN_PASSWORD_LENGTH,
} from "./profile.constants.js";

const optionalNullableString = (maximumLength: number) =>
  z.union([z.string().trim().max(maximumLength), z.null()]).optional();

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(PROFILE_MAX_NAME_LENGTH).optional(),

      phone: optionalNullableString(PROFILE_MAX_PHONE_LENGTH),

      bio: optionalNullableString(PROFILE_MAX_BIO_LENGTH),

      jobTitle: optionalNullableString(PROFILE_MAX_JOB_TITLE_LENGTH),

      department: optionalNullableString(PROFILE_MAX_DEPARTMENT_LENGTH),

      location: optionalNullableString(PROFILE_MAX_LOCATION_LENGTH),

      timezone: optionalNullableString(PROFILE_MAX_TIMEZONE_LENGTH),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one profile field is required",
    }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1).max(PROFILE_MAX_PASSWORD_LENGTH),

      newPassword: z
        .string()
        .min(PROFILE_MIN_PASSWORD_LENGTH)
        .max(PROFILE_MAX_PASSWORD_LENGTH)
        .regex(/[a-z]/, "Password must contain a lowercase letter")
        .regex(/[A-Z]/, "Password must contain an uppercase letter")
        .regex(/\d/, "Password must contain a number"),
    })
    .strict()
    .refine((value) => value.currentPassword !== value.newPassword, {
      path: ["newPassword"],
      message: "New password must be different from the current password",
    }),
});

export const updatePreferencesSchema = z.object({
  body: z
    .object({
      emailNotifications: z.boolean().optional(),

      pushNotifications: z.boolean().optional(),

      reportNotifications: z.boolean().optional(),

      weeklySummary: z.boolean().optional(),

      theme: z.enum(["LIGHT", "DARK", "SYSTEM"]).optional(),

      language: z.enum(["ENGLISH", "HINDI"]).optional(),

      timezone: z
        .string()
        .trim()
        .min(1)
        .max(PROFILE_MAX_TIMEZONE_LENGTH)
        .optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one preference field is required",
    }),
});

export const profileActivitySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(PROFILE_MAX_ACTIVITY_LIMIT)
      .default(10),
  }),
});
