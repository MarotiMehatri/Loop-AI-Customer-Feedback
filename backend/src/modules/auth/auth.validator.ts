import { z } from "zod";

/**
 * =========================================================
 * REGISTER VALIDATION
 * =========================================================
 *
 * The frontend may send:
 *
 * {
 *   name,
 *   email,
 *   password
 * }
 *
 * or:
 *
 * {
 *   name,
 *   email,
 *   password,
 *   workspaceName
 * }
 *
 * workspaceName is therefore optional here.
 */
export const registerSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Name must contain at least 2 characters",
      )
      .max(
        100,
        "Name cannot exceed 100 characters",
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Please provide a valid email address",
      ),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters",
      )
      .max(
        72,
        "Password cannot exceed 72 characters",
      ),

    workspaceName: z
      .string()
      .trim()
      .min(
        2,
        "Workspace name must contain at least 2 characters",
      )
      .max(
        100,
        "Workspace name cannot exceed 100 characters",
      )
      .optional(),
  });

/**
 * =========================================================
 * LOGIN VALIDATION
 * =========================================================
 */
export const loginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(
        "Please provide a valid email address",
      ),

    password: z
      .string()
      .min(
        1,
        "Password is required",
      ),
  });

export type RegisterSchemaInput =
  z.infer<
    typeof registerSchema
  >;

export type LoginSchemaInput =
  z.infer<
    typeof loginSchema
  >;