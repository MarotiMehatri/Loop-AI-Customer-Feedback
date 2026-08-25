import { randomUUID } from "node:crypto";

import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";

import {
  createWorkspaceWithAdmin,
  findPublicUserById,
  findUserByEmail,
  hasRecentEmailVerification,
  updateLastLogin,
} from "./auth.repository.js";

import type {
  AuthResponse,
  JwtPayload,
  LoginInput,
  RegisterInput,
} from "./auth.types.js";

const BCRYPT_SALT_ROUNDS = 12;

/**
 * =========================================================
 * WORKSPACE SLUG
 * =========================================================
 */
const generateWorkspaceSlug = (
  workspaceName: string,
): string => {
  const normalisedName = workspaceName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniquePart = randomUUID().slice(0, 8);

  return `${normalisedName || "workspace"}-${uniquePart}`;
};

/**
 * =========================================================
 * JWT
 * =========================================================
 */
const generateAccessToken = (
  payload: JwtPayload,
): string => {
  const options: SignOptions = {
    expiresIn:
      env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: "loop-backend",
    audience: "loop-frontend",
  };

  return jwt.sign(
    payload,
    env.JWT_SECRET,
    options,
  );
};

/**
 * =========================================================
 * REGISTER USER
 * =========================================================
 *
 * POST /api/v1/auth/register
 */
export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResponse> => {
  const email = input.email
    .trim()
    .toLowerCase();

  /**
   * -------------------------------------------------------
   * Check whether email already exists.
   * -------------------------------------------------------
   */
  const existingUser =
    await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(
      409,
      "A user with this email address already exists",
    );
  }

  /**
   * -------------------------------------------------------
   * Email verification
   * -------------------------------------------------------
   *
   * Development:
   * verification is skipped.
   *
   * Production:
   * verification is required.
   */
  const verifiedEmail =
    await hasRecentEmailVerification(
      email,
    );

  if (
    !verifiedEmail &&
    env.NODE_ENV !== "development"
  ) {
    throw new ApiError(
      400,
      "Verify your email address before creating a workspace",
    );
  }

  /**
   * -------------------------------------------------------
   * Hash password
   * -------------------------------------------------------
   */
  const passwordHash =
    await bcrypt.hash(
      input.password,
      BCRYPT_SALT_ROUNDS,
    );

  /**
   * -------------------------------------------------------
   * Workspace name
   * -------------------------------------------------------
   *
   * If frontend sends workspaceName, use it.
   *
   * If frontend does not send workspaceName,
   * create a default workspace name.
   */
  const workspaceName =
    input.workspaceName?.trim() ||
    `${input.name.trim()}'s Workspace`;

  const workspaceSlug =
    generateWorkspaceSlug(
      workspaceName,
    );

  /**
   * -------------------------------------------------------
   * Create workspace and first user
   * -------------------------------------------------------
   */
  const result =
    await createWorkspaceWithAdmin({
      name: input.name.trim(),
      email,
      passwordHash,
      workspaceName,
      workspaceSlug,
    });

  /**
   * -------------------------------------------------------
   * Create JWT
   * -------------------------------------------------------
   */
  const tokenPayload: JwtPayload = {
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
    workspaceId: result.user.workspaceId,
  };

  const accessToken =
    generateAccessToken(
      tokenPayload,
    );

  /**
   * -------------------------------------------------------
   * Return authentication response
   * -------------------------------------------------------
   */
  return {
    message:
      "Account created successfully",

    accessToken,

    user: result.user,
  };
};

/**
 * =========================================================
 * LOGIN USER
 * =========================================================
 *
 * POST /api/v1/auth/login
 */
export const loginUser = async (
  input: LoginInput,
): Promise<AuthResponse> => {
  const email = input.email
    .trim()
    .toLowerCase();

  const user =
    await findUserByEmail(email);

  /**
   * Do not reveal whether an email exists.
   */
  if (!user) {
    throw new ApiError(
      401,
      "Invalid email address or password",
    );
  }

  /**
   * Account disabled.
   */
  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been disabled",
    );
  }

  /**
   * Check password.
   */
  const passwordMatches =
    await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

  if (!passwordMatches) {
    throw new ApiError(
      401,
      "Invalid email address or password",
    );
  }

  /**
   * Update last login.
   */
  const updatedUser =
    await updateLastLogin(
      user.id,
    );

  /**
   * Create JWT.
   */
  const tokenPayload: JwtPayload = {
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    workspaceId:
      updatedUser.workspaceId,
  };

  const accessToken =
    generateAccessToken(
      tokenPayload,
    );

  return {
    message:
      "Login successful",

    accessToken,

    user: updatedUser,
  };
};

/**
 * =========================================================
 * CURRENT USER
 * =========================================================
 */
export const getCurrentUser = async (
  userId: string,
) => {
  const user =
    await findPublicUserById(
      userId,
    );

  if (!user) {
    throw new ApiError(
      404,
      "User account not found",
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account has been disabled",
    );
  }

  return user;
};