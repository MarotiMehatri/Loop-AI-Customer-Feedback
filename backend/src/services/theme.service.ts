import * as themeRepo from "../repositories/theme.repository.js";
import { ApiError } from "../utils/apiError.js";
import type { CreateThemeInput, UpdateThemeInput, ThemeQueryInput } from "../validators/theme.schema.js";

export async function listThemes(ws: string, query: ThemeQueryInput) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  return themeRepo.findMany(ws, { page, limit, search: query.search, isActive: query.isActive });
}

export async function getTheme(id: string, ws: string) {
  const theme = await themeRepo.findById(id, ws);
  if (!theme) throw new ApiError(404, "Theme not found");
  return theme;
}

export async function createTheme(ws: string, data: CreateThemeInput) {
  try {
    return await themeRepo.create({ workspaceId: ws, ...data });
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ApiError(409, "Theme with this name already exists in this workspace");
    }
    throw error;
  }
}

export async function updateTheme(id: string, ws: string, data: UpdateThemeInput) {
  const existing = await themeRepo.findById(id, ws);
  if (!existing) throw new ApiError(404, "Theme not found");
  try {
    return await themeRepo.update(id, ws, data);
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new ApiError(409, "Theme with this name already exists in this workspace");
    }
    throw error;
  }
}

export async function deleteTheme(id: string, ws: string) {
  const existing = await themeRepo.findById(id, ws);
  if (!existing) throw new ApiError(404, "Theme not found");
  await themeRepo.deleteTheme(id, ws);
}

export async function getThemeStats(ws: string) {
  return themeRepo.getStats(ws);
}
