import { z } from "zod";

const roleSchema = z.enum(["ADMIN", "ANALYST", "VIEWER"]);

export const inviteMemberSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email().max(254),
      role: roleSchema.default("VIEWER"),
    })
    .strict(),
});

export const inviteIdSchema = z.object({
  params: z.object({
    inviteId: z.string().cuid(),
  }),
});

export const listInvitesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z
      .enum(["PENDING", "ACCEPTED", "EXPIRED", "CANCELLED"])
      .optional(),
    sortBy: z
      .enum(["email", "role", "status", "createdAt", "expiresAt"])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});
