import * as bcrypt from "bcrypt";

import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { generatePasswordResetToken, verifyPasswordResetToken } from "./token.service.js";

const BCRYPT_SALT_ROUNDS = 12;

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!user) {
    return { message: "If an account exists with this email, a reset link has been sent" };
  }

  if (!user.isActive) {
    return { message: "If an account exists with this email, a reset link has been sent" };
  }

  const resetToken = generatePasswordResetToken(user.id, user.email);

  // In production, send email with reset link
  // await emailService.sendPasswordReset(user.email, resetToken);

  return { message: "If an account exists with this email, a reset link has been sent" };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  const { userId, email } = verifyPasswordResetToken(token);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  if (user.email !== email.toLowerCase()) {
    throw new ApiError(400, "Invalid reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Password reset successful" };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is disabled");
  }

  const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(400, "Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, "New password must be different from current password");
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Password changed successfully" };
}
