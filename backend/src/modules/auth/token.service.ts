
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { env } from "../../config/env.js";

import type {
  JwtPayload,
} from "./auth.types.js";

export const generateAccessToken = (
  payload: JwtPayload,
): string => {
  const options: SignOptions = {
    expiresIn:
      env.JWT_EXPIRES_IN as SignOptions["expiresIn"],

    issuer: "loop-backend",
    audience: "loop-frontend",
  };

  return jwt.sign(
    payload,
    env.JWT_SECRET,
    options,
  );
};

export const verifyAccessToken = (
  token: string,
): JwtPayload => {
  return jwt.verify(
    token,
    env.JWT_SECRET,
    {
      issuer: "loop-backend",
      audience: "loop-frontend",
    },
  ) as JwtPayload;
};