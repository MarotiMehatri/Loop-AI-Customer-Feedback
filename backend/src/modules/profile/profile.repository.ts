import { Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

import type {
  ProfileActivityInput,
  ProfileActivityQuery,
  UpdateAvatarInput,
  UpdatePreferencesInput,
  UpdateProfileInput,
} from "./profile.types.js";

function toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const profileRepository = {
  async findById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },

      include: {
        preferences: true,
      },
    });
  },

  async updateProfile(
    userId: string,
    workspaceId: string,
    input: UpdateProfileInput,
  ) {
    const result = await prisma.user.updateMany({
      where: {
        id: userId,
        workspaceId,
      },

      data: {
        name: input.name,
        phone: input.phone,
        bio: input.bio,
        jobTitle: input.jobTitle,
        department: input.department,
        location: input.location,
        timezone: input.timezone,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(userId);
  },

  async updateAvatar(
    userId: string,
    workspaceId: string,
    input: UpdateAvatarInput,
  ) {
    const result = await prisma.user.updateMany({
      where: {
        id: userId,
        workspaceId,
      },

      data: {
        avatarUrl: input.avatarUrl,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.findById(userId);
  },

  async findPasswordHash(userId: string, workspaceId: string) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        workspaceId,
      },

      select: {
        id: true,
        passwordHash: true,
      },
    });
  },

  async updatePassword(
    userId: string,
    workspaceId: string,
    passwordHash: string,
  ) {
    return prisma.user.updateMany({
      where: {
        id: userId,
        workspaceId,
      },

      data: {
        passwordHash,
      },
    });
  },

  async findPreferences(userId: string) {
    return prisma.userPreference.findUnique({
      where: {
        userId,
      },
    });
  },

  async upsertPreferences(userId: string, input: UpdatePreferencesInput) {
    return prisma.userPreference.upsert({
      where: {
        userId,
      },

      create: {
        userId,

        emailNotifications: input.emailNotifications ?? true,

        pushNotifications: input.pushNotifications ?? true,

        reportNotifications: input.reportNotifications ?? true,

        weeklySummary: input.weeklySummary ?? true,

        theme: input.theme ?? "SYSTEM",

        language: input.language ?? "ENGLISH",

        timezone: input.timezone ?? "Asia/Kolkata",
      },

      update: {
        emailNotifications: input.emailNotifications,

        pushNotifications: input.pushNotifications,

        reportNotifications: input.reportNotifications,

        weeklySummary: input.weeklySummary,

        theme: input.theme,

        language: input.language,

        timezone: input.timezone,
      },
    });
  },

  async getStatistics(userId: string, workspaceId: string) {
    const [feedbackManaged, reportsGenerated, teamMembers] =
      await prisma.$transaction([
        prisma.feedback.count({
          where: {
            workspaceId,
            createdById: userId,
          },
        }),

        prisma.report.count({
          where: {
            workspaceId,
            userId,
          },
        }),

        prisma.user.count({
          where: {
            workspaceId,
            isActive: true,
          },
        }),
      ]);

    return {
      feedbackManaged,
      reportsGenerated,
      teamMembers,
      workspaces: 1,
    };
  },

  async createActivity(input: ProfileActivityInput) {
    return prisma.activityLog.create({
      data: {
        userId: input.userId,
        workspaceId: input.workspaceId,
        type: input.type,
        title: input.title,
        description: input.description,

        metadata: input.metadata ? toJsonValue(input.metadata) : undefined,
      },
    });
  },

  async listActivity(
    userId: string,
    workspaceId: string,
    query: ProfileActivityQuery,
  ) {
    const skip = (query.page - 1) * query.limit;

    const where: Prisma.ActivityLogWhereInput = {
      userId,
      workspaceId,
    };

    const [items, total] = await prisma.$transaction([
      prisma.activityLog.findMany({
        where,
        skip,
        take: query.limit,

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.activityLog.count({
        where,
      }),
    ]);

    return {
      items,
      total,
    };
  },
};
