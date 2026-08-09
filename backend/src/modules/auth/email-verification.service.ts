import { randomInt } from "node:crypto";

import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { isEmailConfigured, sendOtpEmail } from "./email.service.js";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

export async function requestEmailVerification(email: string): Promise<{ message: string; expiresIn: number; otp?: string; previewUrl?: string }> {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    throw new ApiError(400, "Email is required");
  }

  const otp = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await prisma.emailVerification.updateMany({
    where: { email: normalized, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.emailVerification.create({
    data: { email: normalized, otp, expiresAt },
  });

  try {
    const { previewUrl } = await sendOtpEmail(normalized, otp);
    const shouldShowOtp = env.NODE_ENV === "development" || !isEmailConfigured();

    return {
      message: previewUrl
        ? "Verification code sent - click the email preview to view it"
        : "Verification code sent to your email",
      expiresIn: OTP_EXPIRY_MS / 1000,
      previewUrl,
      ...(shouldShowOtp ? { otp } : {}),
    };
  } catch (error) {
    console.warn(`[email] Sending OTP email failed for ${normalized}:`, error);
    return {
      message: "Email sending failed - showing development OTP",
      expiresIn: OTP_EXPIRY_MS / 1000,
      otp,
    };
  }
}

export async function resendVerification(email: string): Promise<{ message: string; expiresIn: number; otp?: string; previewUrl?: string }> {
  return requestEmailVerification(email);
}

export async function verifyEmail(email: string, otp: string): Promise<{ message: string }> {
  const normalized = email.trim().toLowerCase();

  if (!normalized || !otp) {
    throw new ApiError(400, "Email and verification code are required");
  }

  const record = await prisma.emailVerification.findFirst({
    where: { email: normalized, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new ApiError(400, "No verification code requested for this email");
  }

  if (record.otp !== otp) {
    throw new ApiError(400, "Invalid verification code");
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "Verification code has expired");
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  return { message: "Email verified successfully" };
}
