import { prisma } from "../../config/prisma.js";
import { Role } from "../../generated/prisma/client.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  workspaceId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * =========================================================
 * FIND USER BY EMAIL
 * =========================================================
 */
export const findUserByEmail =
  async (
    email: string,
  ) => {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  };

/**
 * =========================================================
 * CHECK EMAIL VERIFICATION
 * =========================================================
 */
export const hasRecentEmailVerification =
  async (
    email: string,
  ) => {
    return prisma.emailVerification.findFirst(
      {
        where: {
          email,

          usedAt: {
            gte: new Date(
              Date.now() -
                10 *
                  60 *
                  1000,
            ),
          },

          expiresAt: {
            gte: new Date(),
          },
        },

        orderBy: {
          usedAt: "desc",
        },

        select: {
          id: true,
        },
      },
    );
  };

/**
 * =========================================================
 * FIND PUBLIC USER
 * =========================================================
 */
export const findPublicUserById =
  async (
    userId: string,
  ) => {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },

      select:
        publicUserSelect,
    });
  };

interface CreateWorkspaceAdminInput {
  name: string;
  email: string;
  passwordHash: string;
  workspaceName: string;
  workspaceSlug: string;
}

/**
 * =========================================================
 * CREATE WORKSPACE + ADMIN
 * =========================================================
 */
export const createWorkspaceWithAdmin =
  async (
    input: CreateWorkspaceAdminInput,
  ) => {
    const workspace =
      await prisma.workspace.create(
        {
          data: {
            name:
              input.workspaceName,

            slug:
              input.workspaceSlug,

            users: {
              create: {
                name:
                  input.name,

                email:
                  input.email,

                passwordHash:
                  input.passwordHash,

                /**
                 * The first account that creates
                 * the workspace is the workspace ADMIN.
                 */
                role:
                  Role.ADMIN,

                emailVerifiedAt:
                  new Date(),
              },
            },
          },

          include: {
            users: {
              where: {
                email:
                  input.email,
              },

              select:
                publicUserSelect,
            },
          },
        },
      );

    const createdUser =
      workspace.users[0];

    if (!createdUser) {
      throw new Error(
        "User was not returned after workspace creation",
      );
    }

    return {
      workspace: {
        id:
          workspace.id,

        name:
          workspace.name,

        slug:
          workspace.slug,

        createdAt:
          workspace.createdAt,

        updatedAt:
          workspace.updatedAt,
      },

      user:
        createdUser,
    };
  };

/**
 * =========================================================
 * UPDATE LAST LOGIN
 * =========================================================
 */
export const updateLastLogin =
  async (
    userId: string,
  ) => {
    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        lastLoginAt:
          new Date(),
      },

      select:
        publicUserSelect,
    });
  };