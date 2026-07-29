import { mkdir, unlink } from "node:fs/promises";

import path from "node:path";

import multer, { type FileFilterCallback } from "multer";

import type { Request } from "express";

import {
  PROFILE_ALLOWED_AVATAR_TYPES,
  PROFILE_MAX_AVATAR_SIZE,
  PROFILE_MESSAGES,
} from "./profile.constants.js";

const avatarDirectory = path.resolve(process.cwd(), "uploads", "avatars");

function createAvatarFileName(originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();

  const uniquePart = [Date.now(), Math.round(Math.random() * 1_000_000)].join(
    "-",
  );

  return `avatar-${uniquePart}${extension}`;
}

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    void mkdir(avatarDirectory, { recursive: true })
      .then(() => {
        callback(null, avatarDirectory);
      })
      .catch((error: unknown) => {
        callback(
          error instanceof Error
            ? error
            : new Error("Unable to create avatar directory"),
          avatarDirectory,
        );
      });
  },

  filename: (_request, file, callback) => {
    callback(null, createAvatarFileName(file.originalname));
  },
});

function avatarFileFilter(
  _request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void {
  const allowed = PROFILE_ALLOWED_AVATAR_TYPES.includes(
    file.mimetype as (typeof PROFILE_ALLOWED_AVATAR_TYPES)[number],
  );

  if (!allowed) {
    callback(new Error(PROFILE_MESSAGES.invalidAvatarType));
    return;
  }

  callback(null, true);
}

export const profileAvatarUpload = multer({
  storage,
  limits: { fileSize: PROFILE_MAX_AVATAR_SIZE, files: 1 },
  fileFilter: avatarFileFilter,
});

export function buildAvatarUrl(fileName: string): string {
  return `/uploads/avatars/${fileName}`;
}

export async function deleteAvatarFile(
  avatarUrl: string | null | undefined,
): Promise<void> {
  if (!avatarUrl || !avatarUrl.startsWith("/uploads/avatars/")) {
    return;
  }

  const fileName = path.basename(avatarUrl);
  const absolutePath = path.join(avatarDirectory, fileName);

  try {
    await unlink(absolutePath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code !== "ENOENT") {
      throw error;
    }
  }
}
