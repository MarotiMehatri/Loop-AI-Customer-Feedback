import multer from "multer";
import path from "node:path";

const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");

export const uploadPaths = {
  csv: path.join(UPLOADS_ROOT, "csv"),
  avatars: path.join(UPLOADS_ROOT, "avatars"),
  general: path.join(UPLOADS_ROOT, "general"),
} as const;

function createStorage(destination: string) {
  return multer.diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, destination);
    },

    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}${extension}`;
      callback(null, uniqueName);
    },
  });
}

export const csvStorage = createStorage(uploadPaths.csv);
export const avatarStorage = createStorage(uploadPaths.avatars);
export const generalStorage = createStorage(uploadPaths.general);

export const uploadLimits = {
  csv: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },

  avatar: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  general: {
    fileSize: 20 * 1024 * 1024,
    files: 5,
  },
} as const;

const allowedCsvMimeTypes = [
  "text/csv",
  "application/vnd.ms-excel",
] as const;

const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export function csvFileFilter(
  _request: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  const isCsv =
    allowedCsvMimeTypes.includes(
      file.mimetype as (typeof allowedCsvMimeTypes)[number],
    ) || file.originalname.toLowerCase().endsWith(".csv");

  if (!isCsv) {
    callback(new Error("Only CSV files are allowed"));
    return;
  }

  callback(null, true);
}

export function imageFileFilter(
  _request: Express.Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
): void {
  const isImage = allowedImageMimeTypes.includes(
    file.mimetype as (typeof allowedImageMimeTypes)[number],
  );

  if (!isImage) {
    callback(new Error("Only image files (JPEG, PNG, WebP, GIF) are allowed"));
    return;
  }

  callback(null, true);
}
