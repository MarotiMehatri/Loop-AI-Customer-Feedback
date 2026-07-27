import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { generateEmailVerificationToken, verifyEmailVerificationToken } from "./token.service.js";

export async function requestEmailVerification(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const verificationToken = generateEmailVerificationToken(user.id, user.email);

  // In production, send email with verification link
  // await emailService.sendVerification(user.email, verificationToken);

  return { message: "Verification email sent" };
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const { userId, email } = verifyEmailVerificationToken(token);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  if (user.email !== email.toLowerCase()) {
    throw new ApiError(400, "Invalid verification token");
  }

  // If email verification field existed on user model, update it here
  // await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });

  return { message: "Email verified successfully" };
}

export async function resendVerification(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const verificationToken = generateEmailVerificationToken(user.id, user.email);

  // In production, send email
  // await emailService.sendVerification(user.email, verificationToken);

  return { message: "Verification email resent" };
}
