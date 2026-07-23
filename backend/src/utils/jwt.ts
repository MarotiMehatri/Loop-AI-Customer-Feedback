import * as crypto from "node:crypto";
import { env } from "../config/env.js";

interface TokenPayload {
  userId: string;
  workspaceId: string;
  role: string;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Buffer {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64");
}

export function generateToken(payload: TokenPayload): string {
  const header = base64url(
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  );
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    Buffer.from(
      JSON.stringify({ ...payload, iat: now, exp: now + 7 * 24 * 60 * 60 }),
    ),
  );
  const signature = base64url(
    crypto
      .createHmac("sha256", env.JWT_SECRET)
      .update(`${header}.${body}`)
      .digest(),
  );
  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string): Promise<DecodedToken> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token");
  const [header, body, sig] = parts;
  const expected = base64url(
    crypto
      .createHmac("sha256", env.JWT_SECRET)
      .update(`${header}.${body}`)
      .digest(),
  );
  if (sig !== expected) throw new Error("Invalid token signature");
  const payload = JSON.parse(base64urlDecode(body).toString()) as DecodedToken;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
    throw new Error("Token expired");
  return payload;
}
