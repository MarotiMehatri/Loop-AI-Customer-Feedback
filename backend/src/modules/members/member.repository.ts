import { Prisma, Role } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import { buildMemberOrderBy, buildMemberWhere } from "./member.query.js";

import type {
  MemberListQuery,
  UpdateMemberInput,
} from "./member.types.js";

const memberInclude = {
  preferences: {
    select: {
      emailNotifications: true,
      pushNotifications: true,
      reportNotifications: true,
      weeklySummary: true,
      theme: true,
      language: true,
      timezone: true,
    },
  },
} as const;

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
        include: memberInclude,
      }),
      prisma.user.count({ where }),
    ]);

    return { items, total };
  },

  async findById(memberId: string, workspaceId: string) {
    return prisma.user.findFirst({
      where: { id: memberId, workspaceId },
      include: memberInclude,
    });
  },

  async findByEmail(email: string, workspaceId: string) {
    return prisma.user.findFirst({
      where: {
        workspaceId,
        email: { equals: email, mode: "insensitive" },
      },
    });
  },

  async update(
    memberId: string,
    workspaceId: string,
    input: UpdateMemberInput,
  ) {
    const data: Prisma.UserUpdateManyMutationInput = {};

    if (input.name !== undefined) data.name = input.name;
    if (input.role !== undefined) data.role = input.role;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.department !== undefined) data.department = input.department;
    if (input.jobTitle !== undefined) data.jobTitle = input.jobTitle;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.bio !== undefined) data.bio = input.bio;
    if (input.location !== undefined) data.location = input.location;
    if (input.timezone !== undefined) data.timezone = input.timezone;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl;

    const result = await prisma.user.updateMany({
      where: { id: memberId, workspaceId },
      data,
    });

    if (result.count === 0) return null;

    return this.findById(memberId, workspaceId);
  },

  async remove(memberId: string, workspaceId: string) {
    return prisma.user.deleteMany({
      where: { id: memberId, workspaceId },
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
      departmentGroups,
    ] = await prisma.$transaction([
      prisma.user.count({ where: { workspaceId } }),
      prisma.user.count({ where: { workspaceId, isActive: true } }),
      prisma.user.count({ where: { workspaceId, isActive: false } }),
      prisma.user.count({ where: { workspaceId, role: Role.ADMIN } }),
      prisma.user.count({ where: { workspaceId, role: Role.ANALYST } }),
      prisma.user.count({ where: { workspaceId, role: Role.VIEWER } }),
      prisma.workspaceInvite.count({
        where: {
          workspaceId,
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
      }),
      prisma.user.groupBy({
        by: ["department"],
        where: {
          workspaceId,
          department: { not: null },
        },
        _count: { department: true },
        orderBy: { department: "asc" },
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
      departments: departmentGroups
        .filter((g) => g.department !== null)
        .map((g) => ({
          department: g.department as string,
          count: (g._count as { department: number }).department,
        })),
    };
  },
};
