import { z } from "zod";

import {
  MEMBER_DEPARTMENT_MAX,
  MEMBER_JOB_TITLE_MAX,
  MEMBER_MAX_LIMIT,
  MEMBER_NAME_MAX,
  MEMBER_NAME_MIN,
  MEMBER_SEARCH_MAX,
} from "./member.constants.js";

import { MEMBER_SORT_FIELDS, MEMBER_SORT_ORDERS } from "./member.types.js";

const roleSchema = z.enum(["ADMIN", "ANALYST", "VIEWER"]);

const memberIdParamsSchema = z.object({
  memberId: z.string().cuid(),
});

export const listMembersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(MEMBER_MAX_LIMIT).default(10),

    search: z.string().trim().max(MEMBER_SEARCH_MAX).optional(),

    role: roleSchema.optional(),

    department: z
      .string()
      .trim()
      .max(MEMBER_DEPARTMENT_MAX)
      .optional(),

    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),

    sortBy: z.enum(MEMBER_SORT_FIELDS).default("createdAt"),

    sortOrder: z.enum(MEMBER_SORT_ORDERS).default("desc"),
  }),
});

export const memberIdSchema = z.object({
  params: memberIdParamsSchema,
});

export const updateMemberSchema = z.object({
  params: memberIdParamsSchema,

  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(MEMBER_NAME_MIN)
        .max(MEMBER_NAME_MAX)
        .optional(),

      role: roleSchema.optional(),

      isActive: z.boolean().optional(),

      department: z
        .string()
        .trim()
        .max(MEMBER_DEPARTMENT_MAX)
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),

      jobTitle: z
        .string()
        .trim()
        .max(MEMBER_JOB_TITLE_MAX)
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),

      phone: z
        .string()
        .trim()
        .max(30)
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),

      bio: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),

      location: z
        .string()
        .trim()
        .max(100)
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),

      timezone: z
        .string()
        .trim()
        .max(50)
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),

      avatarUrl: z
        .string()
        .url()
        .nullable()
        .optional()
        .transform((v) => (v === "" ? null : v)),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const changeMemberRoleSchema = z.object({
  params: memberIdParamsSchema,

  body: z
    .object({
      role: roleSchema,
    })
    .strict(),
});

export const changeMemberStatusSchema = z.object({
  params: memberIdParamsSchema,

  body: z
    .object({
      isActive: z.boolean(),
    })
    .strict(),
});
