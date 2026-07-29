import { z } from "zod";

import {
  WORKSPACE_DELETE_CONFIRMATION,
  WORKSPACE_MAX_NAME_LENGTH,
  WORKSPACE_MIN_NAME_LENGTH,
} from "./workspace.constants.js";

export const createWorkspaceSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(WORKSPACE_MIN_NAME_LENGTH)
        .max(WORKSPACE_MAX_NAME_LENGTH),
    })
    .strict(),
});

export const updateWorkspaceSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(WORKSPACE_MIN_NAME_LENGTH)
        .max(WORKSPACE_MAX_NAME_LENGTH),
    })
    .strict(),
});

export const deleteWorkspaceSchema = z.object({
  body: z
    .object({
      confirmation: z.literal(WORKSPACE_DELETE_CONFIRMATION),
    })
    .strict(),
});

export const workspaceIdParamSchema = z.object({
  params: z.object({
    workspaceId: z.string().cuid(),
  }),
});

export const switchWorkspaceSchema = z.object({
  body: z
    .object({
      workspaceId: z.string().cuid(),
    })
    .strict(),
});

export const usageQuerySchema = z.object({
  query: z.object({
    period: z
      .enum(["daily", "weekly", "monthly"])
      .default("monthly"),
  }),
});
