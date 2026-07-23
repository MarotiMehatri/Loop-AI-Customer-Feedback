import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";

interface JwtPayload {
  userId: string;
  role: string;
  workspaceId: string;
}

interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

function base64urlEncode(data: string): string {
  return Buffer.from(data).toString("base64url");
}

function base64urlDecode(str: string): Buffer {
  return Buffer.from(str, "base64url");
}

function parseExpiresIn(s: string): number {
  const m = s.match(/^(\d+)([hd])$/);
  if (!m) return 7 * 86400000;
  return parseInt(m[1]) * (m[2] === "h" ? 3600000 : 86400000);
}

export function generateToken(payload: JwtPayload): string {
  const secret = env.JWT_SECRET;
  const expiresIn = env.JWT_EXPIRES_IN;
  const header = base64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Date.now();
  const exp = now + parseExpiresIn(expiresIn);
  const tokenPayload = base64urlEncode(JSON.stringify({ ...payload, iat: now, exp }));
  const signature = createHmac("sha256", secret).update(`${header}.${tokenPayload}`).digest("base64url");
  return `${header}.${tokenPayload}.${signature}`;
}

export async function verifyToken(token: string): Promise<DecodedToken> {
  const secret = env.JWT_SECRET;
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [header, payload, sig] = parts;
  const expected = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");
  if (!timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expected, "base64url"))) {
    throw new Error("Invalid token signature");
  }
  const decoded = JSON.parse(base64urlDecode(payload).toString()) as DecodedToken;
  if (Date.now() > decoded.exp) throw new Error("Token expired");
  return { userId: decoded.userId, role: decoded.role, workspaceId: decoded.workspaceId, iat: decoded.iat, exp: decoded.exp };
}
