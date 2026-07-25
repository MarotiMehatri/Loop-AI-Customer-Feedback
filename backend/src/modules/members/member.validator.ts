import { z } from "zod";

import { MEMBER_MAX_LIMIT } from "./member.constants.js";

import { MEMBER_SORT_FIELDS, MEMBER_SORT_ORDERS } from "./member.types.js";

const roleSchema = z.enum(["ADMIN", "ANALYST", "VIEWER"]);

const memberIdParamsSchema = z.object({
  memberId: z.string().cuid(),
});

const inviteIdParamsSchema = z.object({
  inviteId: z.string().cuid(),
});

export const listMembersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(MEMBER_MAX_LIMIT).default(10),

    search: z.string().trim().max(200).optional(),

    role: roleSchema.optional(),

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
      name: z.string().trim().min(2).max(100).optional(),

      role: roleSchema.optional(),

      isActive: z.boolean().optional(),
    })
    .strict()
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field must be provided",
    }),
});

export const inviteMemberSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email().max(254),

      role: roleSchema.default("VIEWER"),
    })
    .strict(),
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

export const inviteIdSchema = z.object({
  params: inviteIdParamsSchema,
});
