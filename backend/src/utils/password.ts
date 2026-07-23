import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  const [salt, keyHex] = hash.split(":");
  if (!salt || !keyHex) return false;

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const keyBuffer = Buffer.from(keyHex, "hex");

  if (derivedKey.length !== keyBuffer.length) return false;

  return timingSafeEqual(derivedKey, keyBuffer);
};
