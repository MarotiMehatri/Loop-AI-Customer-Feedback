import type { Prisma } from "../generated/prisma/client.js";

type FilterValue = string | number | boolean | null | undefined;

interface FilterObject {
  [key: string]: FilterValue | { contains?: string; mode?: "insensitive" };
}

export function buildWhereClause(filters: FilterObject): Prisma.FeedbackWhereInput {
  const where: Prisma.FeedbackWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined || value === "") continue;

    if (typeof value === "object" && "contains" in value) {
      (where as Record<string, unknown>)[key] = value;
    } else if (typeof value === "string" && key === "search") {
      where.content = { contains: value, mode: "insensitive" };
    } else {
      (where as Record<string, unknown>)[key] = value;
    }
  }

  return where;
}
