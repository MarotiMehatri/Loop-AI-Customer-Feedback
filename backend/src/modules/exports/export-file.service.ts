import path from "node:path";
import fs from "node:fs/promises";

const EXPORTS_DIR = path.resolve(process.cwd(), "uploads", "exports");

async function ensureDir(): Promise<void> {
  try {
    await fs.access(EXPORTS_DIR);
  } catch {
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
  }
}

export const exportFileService = {
  async write(fileName: string, content: Buffer): Promise<string> {
    await ensureDir();

    const filePath = path.join(EXPORTS_DIR, fileName);

    await fs.writeFile(filePath, content, "utf-8");

    return filePath;
  },

  async getDownloadInfo(
    filePath: string,
    name: string,
    format: string,
  ): Promise<{
    filePath: string;
    fileName: string;
    fileSize: number | null;
    format: string;
  } | null> {
    try {
      await fs.access(filePath);

      const stats = await fs.stat(filePath);

      return {
        filePath,
        fileName: `${name}.${format.toLowerCase()}`,
        fileSize: stats.size,
        format,
      };
    } catch {
      return null;
    }
  },
};
