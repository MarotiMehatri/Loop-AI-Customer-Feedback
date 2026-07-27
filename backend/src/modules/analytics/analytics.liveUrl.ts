import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiError.js";
import type {
  CreateLiveUrlInput,
  LiveUrlInfo,
  LiveUrlPayload,
  AnalyticsQueryInput,
} from "./analytics.types.js";
import { analyticsService } from "./analytics.service.js";

const LIVE_URL_SECRET = env.JWT_SECRET + "_live_url";
const DEFAULT_EXPIRY_HOURS = 24;
const MAX_EXPIRY_HOURS = 720;

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64urlDecode(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

export function generateLiveUrlToken(
  workspaceId: string,
  userId: string,
  expiresInHours: number,
  filters?: CreateLiveUrlInput["filters"],
): string {
  const now = Date.now();
  const expiresAt = now + expiresInHours * 60 * 60 * 1000;

  const payload: LiveUrlPayload = {
    workspaceId,
    userId,
    filters: filters as AnalyticsQueryInput | undefined,
    expiresAt,
    createdAt: now,
  };

  const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "LIVE" }));
  const body = base64urlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", LIVE_URL_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  return `${header}.${body}.${signature}`;
}

export function verifyLiveUrlToken(token: string): LiveUrlPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new ApiError(400, "Invalid live URL token format");

  const header = parts[0]!;
  const body = parts[1]!;
  const sig = parts[2]!;
  const expected = createHmac("sha256", LIVE_URL_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  if (!timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expected, "base64url"))) {
    throw new ApiError(400, "Invalid live URL token signature");
  }

  const decoded = JSON.parse(base64urlDecode(body).toString()) as LiveUrlPayload;

  if (Date.now() > decoded.expiresAt) {
    throw new ApiError(410, "Live URL has expired");
  }

  return decoded;
}

export function createLiveUrl(
  workspaceId: string,
  userId: string,
  input: CreateLiveUrlInput,
): LiveUrlInfo {
  const expiresInHours = Math.min(input.expiresInHours ?? DEFAULT_EXPIRY_HOURS, MAX_EXPIRY_HOURS);
  const token = generateLiveUrlToken(workspaceId, userId, expiresInHours, input.filters);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

  const baseUrl = env.FRONTEND_URL || "http://localhost:3000";
  const url = `${baseUrl}/analytics/live/${token}`;

  return {
    token,
    url,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    filters: input.filters,
  };
}

export async function getLiveAnalytics(token: string) {
  const payload = verifyLiveUrlToken(token);

  const analyticsInput: AnalyticsQueryInput = {
    workspaceId: payload.workspaceId,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    groupBy: "day",
    ...(payload.filters || {}),
  };

  const dashboard = await analyticsService.getDashboard(analyticsInput);

  return {
    dashboard,
    meta: {
      workspaceId: payload.workspaceId,
      generatedBy: payload.userId,
      expiresAt: new Date(payload.expiresAt).toISOString(),
      createdAt: new Date(payload.createdAt).toISOString(),
      filters: payload.filters,
    },
  };
}
