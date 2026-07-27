import { ApiError } from "../../utils/apiError.js";

import {
  createSavedViewRecord,
  deleteSavedViewRecord,
  findSavedViewById,
  findSavedViewList,
  updateSavedViewRecord,
} from "./savedViews.repository.js";

import type {
  CreateSavedViewInput,
  SavedViewListFilters,
  PaginationMetadata,
  UpdateSavedViewInput,
} from "./savedViews.types.js";

export const createSavedView = async (
  input: CreateSavedViewInput,
  workspaceId: string,
  userId: string,
) => {
  const view = await createSavedViewRecord({
    ...input,
    name: input.name.trim(),
    description: input.description?.trim(),
    workspaceId,
    createdById: userId,
  });

  return view;
};

export const getSavedView = async (viewId: string, workspaceId: string) => {
  const view = await findSavedViewById(viewId, workspaceId);

  if (!view) {
    throw new ApiError(404, "Saved view was not found");
  }

  return view;
};

export const getSavedViewList = async (
  workspaceId: string,
  filters: SavedViewListFilters,
) => {
  const result = await findSavedViewList(workspaceId, filters);

  const totalPages = Math.ceil(result.totalItems / filters.limit);

  const pagination: PaginationMetadata = {
    page: filters.page,
    limit: filters.limit,
    totalItems: result.totalItems,
    totalPages,
    hasNextPage: filters.page < totalPages,
    hasPreviousPage: filters.page > 1,
  };

  return {
    views: result.views,
    pagination,
  };
};

export const updateSavedView = async (
  viewId: string,
  workspaceId: string,
  input: UpdateSavedViewInput,
) => {
  await getSavedView(viewId, workspaceId);

  const normalizedInput: UpdateSavedViewInput = {
    ...input,

    ...(input.name !== undefined
      ? { name: input.name.trim() }
      : {}),

    ...(input.description !== undefined
      ? { description: input.description?.trim() || null }
      : {}),
  };

  const view = await updateSavedViewRecord(
    viewId,
    workspaceId,
    normalizedInput,
  );

  return view;
};

export const deleteSavedView = async (
  viewId: string,
  workspaceId: string,
) => {
  await getSavedView(viewId, workspaceId);

  await deleteSavedViewRecord(viewId, workspaceId);
};
