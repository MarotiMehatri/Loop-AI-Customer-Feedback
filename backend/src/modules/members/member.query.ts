import type { Prisma } from "../../generated/prisma/client.js";

import type { MemberListQuery } from "./member.types.js";

export function buildMemberWhere(
  workspaceId: string,
  query: MemberListQuery,
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {
    workspaceId,
  };

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (query.role) {
    where.role = query.role;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  return where;
}

export function buildMemberOrderBy(
  query: MemberListQuery,
): Prisma.UserOrderByWithRelationInput {
  switch (query.sortBy) {
    case "name":
      return {
        name: query.sortOrder,
      };

    case "email":
      return {
        email: query.sortOrder,
      };

    case "role":
      return {
        role: query.sortOrder,
      };

    case "updatedAt":
      return {
        updatedAt: query.sortOrder,
      };

    case "createdAt":
    default:
      return {
        createdAt: query.sortOrder,
      };
  }
}
