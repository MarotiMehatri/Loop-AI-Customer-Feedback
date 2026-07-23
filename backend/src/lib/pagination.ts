export interface PaginationParams { page: number; limit: number; skip: number; take: number }
export interface PaginationMeta { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean }

export function parsePagination(query: { page?: string; limit?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20", 10) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildPagination(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 };
}
