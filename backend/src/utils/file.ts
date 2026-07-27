import { unlink, mkdir } from "node:fs/promises";
import { extname } from "node:path";

const MIME_MAP: Record<string, string> = {
  ".json": "application/json",
  ".csv": "text/csv",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export function getFileExtension(filename: string): string {
  return extname(filename).toLowerCase();
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  return MIME_MAP[ext] ?? "application/octet-stream";
}

export async function deleteFile(filePath: string): Promise<void> {
  await unlink(filePath);
}

export async function ensureDirectory(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}
