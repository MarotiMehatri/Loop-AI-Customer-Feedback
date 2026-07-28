import { z } from "zod";
import {
  WORKSPACE_DELETE_CONFIRMATION,
  WORKSPACE_MAX_NAME_LENGTH,
  WORKSPACE_MIN_NAME_LENGTH,
} from "./workspace.constants.js";

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
