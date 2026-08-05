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
  updateLastLogin,
} from "./auth.repository.js";

import type {
  AuthResponse,
  JwtPayload,
  LoginInput,
  RegisterInput,
} from "./auth.types.js";

const BCRYPT_SALT_ROUNDS = 12;

const generateWorkspaceSlug = (workspaceName: string): string => {
  const normalisedName = workspaceName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniquePart = randomUUID().slice(0, 8);

  return `${normalisedName || "workspace"}-${uniquePart}`;
};

const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],

    issuer: "loop-backend",
    audience: "loop-frontend",
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthResponse> => {
  const email = input.email.trim().toLowerCase();

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "A user with this email address already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

  const result = await createWorkspaceWithAdmin({
    name: input.name.trim(),
    email,
    passwordHash,
    workspaceName: input.workspaceName.trim(),
    workspaceSlug: generateWorkspaceSlug(input.workspaceName),
  });

  const tokenPayload: JwtPayload = {
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
    workspaceId: result.user.workspaceId,
  };

  const accessToken = generateAccessToken(tokenPayload);

  return {
    message: "Account created successfully",
    accessToken,
    user: result.user,
  };
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const email = input.email.trim().toLowerCase();

  const user = await findUserByEmail(email);

  /*
   * We deliberately use the same message when:
   * 1. The email does not exist.
   * 2. The password is incorrect.
   *
   * This prevents attackers from checking which emails exist.
   */
  if (!user) {
    throw new ApiError(401, "Invalid email address or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been disabled");
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email address or password");
  }

  const updatedUser = await updateLastLogin(user.id);

  const tokenPayload: JwtPayload = {
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    workspaceId: updatedUser.workspaceId,
  };

  const accessToken = generateAccessToken(tokenPayload);

  return {
    message: "Login successful",
    accessToken,
    user: updatedUser,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await findPublicUserById(userId);

  if (!user) {
    throw new ApiError(404, "User account not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account has been disabled");
  }

  return user;
};
