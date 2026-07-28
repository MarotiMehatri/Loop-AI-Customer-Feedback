import type { SavedView, User } from "../../generated/prisma/client.js";

import type { SavedViewFilters } from "./savedViews.types.js";

type SavedViewWithCreatedBy = SavedView & {
  createdBy: Pick<User, "id" | "name" | "email">;
};

interface SavedViewResponse {
  id: string;
  name: string;
  description: string | null;
  filters: SavedViewFilters;
  isDefault: boolean;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const toSavedViewResponse = (
  view: SavedViewWithCreatedBy,
): SavedViewResponse => ({
  id: view.id,
  name: view.name,
  description: view.description,
  filters: view.filters as SavedViewFilters,
  isDefault: view.isDefault,
  createdBy: {
    id: view.createdBy.id,
    name: view.createdBy.name,
    email: view.createdBy.email,
  },
  createdAt: view.createdAt,
  updatedAt: view.updatedAt,
});

export const toSavedViewListResponse = (
  views: SavedViewWithCreatedBy[],
): SavedViewResponse[] => views.map(toSavedViewResponse);

export const toSavedViewSummary = (
  view: SavedViewWithCreatedBy,
) => ({
  id: view.id,
  name: view.name,
  isDefault: view.isDefault,
  createdAt: view.createdAt,
});

export const normalizeFilters = (
  filters: Record<string, unknown>,
): SavedViewFilters => {
  const normalized: SavedViewFilters = {};

  if (filters.search && typeof filters.search === "string") {
    normalized.search = filters.search.trim();
  }

  if (filters.status && typeof filters.status === "string") {
    normalized.status = filters.status;
  }

  if (filters.sentiment && typeof filters.sentiment === "string") {
    normalized.sentiment = filters.sentiment;
  }

  if (filters.source && typeof filters.source === "string") {
    normalized.source = filters.source;
  }

  if (filters.dateFrom && typeof filters.dateFrom === "string") {
    normalized.dateFrom = filters.dateFrom;
  }

  if (filters.dateTo && typeof filters.dateTo === "string") {
    normalized.dateTo = filters.dateTo;
  }

  if (Array.isArray(filters.tags)) {
    normalized.tags = filters.tags.filter(
      (tag): tag is string => typeof tag === "string",
    );
  }

  if (Array.isArray(filters.themes)) {
    normalized.themes = filters.themes.filter(
      (theme): theme is string => typeof theme === "string",
    );
  }

  if (filters.rating !== undefined && filters.rating !== null) {
    const rating = Number(filters.rating);
    if (!Number.isNaN(rating) && rating >= 1 && rating <= 5) {
      normalized.rating = rating;
    }
  }

  return normalized;
};
