import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";
import type { JwtPayload } from "./auth.types.js";

const REFRESH_TOKEN_EXPIRY = "30d";
const PASSWORD_RESET_EXPIRY = "1h";
const EMAIL_VERIFY_EXPIRY = "24h";

export function generateAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: "loop-backend",
    audience: "loop-frontend",
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: "loop-backend",
    audience: "loop-frontend",
  };

  return jwt.sign({ ...payload, type: "refresh" }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "loop-backend",
      audience: "loop-frontend",
    });

    if (typeof decoded === "string" || !decoded.userId || !decoded.email || !decoded.role || !decoded.workspaceId) {
      throw new ApiError(401, "Invalid access token");
    }

    return {
      userId: String(decoded.userId),
      email: String(decoded.email),
      role: decoded.role as JwtPayload["role"],
      workspaceId: String(decoded.workspaceId),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Access token has expired");
    }
    throw new ApiError(401, "Invalid access token");
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "loop-backend",
      audience: "loop-frontend",
    });

    if (typeof decoded === "string" || !decoded.userId || !decoded.email) {
      throw new ApiError(401, "Invalid refresh token");
    }

    return {
      userId: String(decoded.userId),
      email: String(decoded.email),
      role: decoded.role as JwtPayload["role"],
      workspaceId: String(decoded.workspaceId),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Refresh token has expired");
    }
    throw new ApiError(401, "Invalid refresh token");
  }
}

export function generatePasswordResetToken(userId: string, email: string): string {
  const token = jwt.sign(
    { userId, email, type: "password_reset" },
    env.JWT_SECRET,
    { expiresIn: PASSWORD_RESET_EXPIRY, issuer: "loop-backend" },
  );
  return token;
}

export function verifyPasswordResetToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: "loop-backend" });

    if (typeof decoded === "string" || !decoded.userId || !decoded.email || decoded.type !== "password_reset") {
      throw new ApiError(400, "Invalid password reset token");
    }

    return { userId: String(decoded.userId), email: String(decoded.email) };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Invalid or expired password reset token");
  }
}

export function generateEmailVerificationToken(userId: string, email: string): string {
  const token = jwt.sign(
    { userId, email, type: "email_verify" },
    env.JWT_SECRET,
    { expiresIn: EMAIL_VERIFY_EXPIRY, issuer: "loop-backend" },
  );
  return token;
}

export function verifyEmailVerificationToken(token: string): { userId: string; email: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, { issuer: "loop-backend" });

    if (typeof decoded === "string" || !decoded.userId || !decoded.email || decoded.type !== "email_verify") {
      throw new ApiError(400, "Invalid email verification token");
    }

    return { userId: String(decoded.userId), email: String(decoded.email) };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "Invalid or expired email verification token");
  }
}

export function generateApiKey(): { key: string; prefix: string } {
  const key = `loop_${randomUUID().replace(/-/g, "")}`;
  const prefix = key.slice(0, 12);
  return { key, prefix };
}
