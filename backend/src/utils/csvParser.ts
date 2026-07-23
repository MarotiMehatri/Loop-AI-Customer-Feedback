import fs from "node:fs/promises";
import { parse } from "csv-parse/sync";

export const parseCsvFile = async <T>(filePath: string): Promise<T[]> => {
  const fileContent = await fs.readFile(filePath, "utf-8");

  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as T[];
};
