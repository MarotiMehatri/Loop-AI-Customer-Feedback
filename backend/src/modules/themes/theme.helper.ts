import { THEME_COLOR_PALETTE } from "./theme.constants.js";

export function normalizeThemeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeThemeDescription(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  return normalized.length > 0 ? normalized : null;
}

export function normalizeThemeColor(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value.trim().toUpperCase();
}

export function normalizeThemeLookupName(value: string): string {
  return normalizeThemeName(value).toLowerCase();
}

export function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function selectThemeColor(index: number): string {
  return THEME_COLOR_PALETTE[index % THEME_COLOR_PALETTE.length] ?? "#7C3AED";
}

export function clampNumber(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

export function percentage(value: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
}

export function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
