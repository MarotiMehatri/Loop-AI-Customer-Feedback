import { randomUUID, createHash } from "node:crypto";

export function generateId(): string {
  return randomUUID();
}

export function hashString(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function compareHash(value: string, hashed: string): boolean {
  return hashString(value) === hashed;
}
