import {
  Prisma,
  Role,
  WorkspaceInviteStatus,
} from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

export const memberInviteRepository = {
  async findPendingInvite(workspaceId: string, email: string) {
    return prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        email: { equals: email, mode: "insensitive" },
        status: WorkspaceInviteStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
    });
  },

  async create(input: {
    workspaceId: string;
    invitedById: string;
    email: string;
    role: Role;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.workspaceInvite.create({
      data: {
        workspaceId: input.workspaceId,
        invitedById: input.invitedById,
        email: input.email,
        role: input.role,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        status: WorkspaceInviteStatus.PENDING,
      },
    });
  },

  async findById(inviteId: string, workspaceId: string) {
    return prisma.workspaceInvite.findFirst({
      where: { id: inviteId, workspaceId },
    });
  },

  async list(
    workspaceId: string,
    query: {
      page: number;
      limit: number;
      status?: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    },
  ) {
    const where: Prisma.WorkspaceInviteWhereInput = { workspaceId };

    if (query.status) {
      where.status = query.status as WorkspaceInviteStatus;
    }

    const skip = (query.page - 1) * query.limit;

    const orderBy: Prisma.WorkspaceInviteOrderByWithRelationInput = {
      [query.sortBy]: query.sortOrder,
    };

    const [items, total] = await prisma.$transaction([
      prisma.workspaceInvite.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
      }),
      prisma.workspaceInvite.count({ where }),
    ]);

    return { items, total };
  },

  async updateToken(
    inviteId: string,
    workspaceId: string,
    input: {
      tokenHash: string;
      expiresAt: Date;
      role?: Role;
    },
  ) {
    const result = await prisma.workspaceInvite.updateMany({
      where: {
        id: inviteId,
        workspaceId,
        status: WorkspaceInviteStatus.PENDING,
      },
      data: {
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        role: input.role,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(inviteId, workspaceId);
  },

  async cancel(inviteId: string, workspaceId: string) {
    return prisma.workspaceInvite.updateMany({
      where: {
        id: inviteId,
        workspaceId,
        status: WorkspaceInviteStatus.PENDING,
      },
      data: {
        status: WorkspaceInviteStatus.CANCELLED,
      },
    });
  },

  async expirePastDue() {
    return prisma.workspaceInvite.updateMany({
      where: {
        status: WorkspaceInviteStatus.PENDING,
        expiresAt: { lte: new Date() },
      },
      data: {
        status: WorkspaceInviteStatus.EXPIRED,
      },
    });
  },
};
