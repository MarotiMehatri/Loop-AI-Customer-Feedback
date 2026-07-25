import {
  Prisma,
  Role,
  WorkspaceInviteStatus,
} from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildMemberOrderBy, buildMemberWhere } from "./member.query.js";

import type {
  InviteMemberInput,
  MemberListQuery,
  UpdateMemberInput,
} from "./member.types.js";

export const memberRepository = {
  async list(workspaceId: string, query: MemberListQuery) {
    const where = buildMemberWhere(workspaceId, query);

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: buildMemberOrderBy(query),
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },

  async findById(memberId: string, workspaceId: string) {
    return prisma.user.findFirst({
      where: {
        id: memberId,
        workspaceId,
      },
    });
  },

  async findByEmail(email: string, workspaceId: string) {
    return prisma.user.findFirst({
      where: {
        workspaceId,
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
  },

  async update(
    memberId: string,
    workspaceId: string,
    input: UpdateMemberInput,
  ) {
    const data: Prisma.UserUpdateManyMutationInput = {};

    if (input.name !== undefined) {
      data.name = input.name;
    }

    if (input.role !== undefined) {
      data.role = input.role;
    }

    if (input.isActive !== undefined) {
      data.isActive = input.isActive;
    }

    const result = await prisma.user.updateMany({
      where: {
        id: memberId,
        workspaceId,
      },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(memberId, workspaceId);
  },

  async remove(memberId: string, workspaceId: string) {
    return prisma.user.deleteMany({
      where: {
        id: memberId,
        workspaceId,
      },
    });
  },

  async countActiveAdmins(workspaceId: string): Promise<number> {
    return prisma.user.count({
      where: {
        workspaceId,
        role: Role.ADMIN,
        isActive: true,
      },
    });
  },

  async getSummary(workspaceId: string) {
    const [
      total,
      active,
      inactive,
      administrators,
      analysts,
      viewers,
      pendingInvites,
    ] = await prisma.$transaction([
      prisma.user.count({
        where: { workspaceId },
      }),

      prisma.user.count({
        where: {
          workspaceId,
          isActive: true,
        },
      }),

      prisma.user.count({
        where: {
          workspaceId,
          isActive: false,
        },
      }),

      prisma.user.count({
        where: {
          workspaceId,
          role: Role.ADMIN,
        },
      }),

      prisma.user.count({
        where: {
          workspaceId,
          role: Role.ANALYST,
        },
      }),

      prisma.user.count({
        where: {
          workspaceId,
          role: Role.VIEWER,
        },
      }),

      prisma.workspaceInvite.count({
        where: {
          workspaceId,
          status: WorkspaceInviteStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      administrators,
      analysts,
      viewers,
      pendingInvites,
    };
  },

  async findPendingInvite(workspaceId: string, email: string) {
    return prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        email: {
          equals: email,
          mode: "insensitive",
        },
        status: WorkspaceInviteStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  },

  async createInvite(input: {
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

  async findInviteById(inviteId: string, workspaceId: string) {
    return prisma.workspaceInvite.findFirst({
      where: {
        id: inviteId,
        workspaceId,
      },
    });
  },

  async updateInviteToken(
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

    return this.findInviteById(inviteId, workspaceId);
  },

  async cancelInvite(inviteId: string, workspaceId: string) {
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
};
