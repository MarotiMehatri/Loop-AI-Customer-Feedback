import { createHash, randomBytes } from "node:crypto";

import { MEMBER_INVITE_EXPIRY_HOURS } from "./member.constants.js";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeMemberName(name: string): string {
  return name.replace(/\s+/g, " ").trim();
}

export function createInvitationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = randomBytes(32).toString("hex");

  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  return {
    rawToken,
    tokenHash,
  };
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createInvitationExpiry(): Date {
  const expiresAt = new Date();

  expiresAt.setHours(expiresAt.getHours() + MEMBER_INVITE_EXPIRY_HOURS);

  return expiresAt;
}
