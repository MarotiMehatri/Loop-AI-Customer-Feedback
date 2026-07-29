import * as jwt from "jsonwebtoken";

import { env } from "../../config/env.js";

import { prisma } from "../../config/prisma.js";

import { ApiError } from "../../utils/apiError.js";

import { mapWorkspace } from "./workspace.mapper.js";

import type {
  AvailableWorkspace,
  SwitchWorkspaceResult,
} from "./workspace.types.js";

function generateToken(payload: {
  userId: string;
  email: string;
  role: string;
  workspaceId: string;
}): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
    issuer: "loop-backend",
    audience: "loop-frontend",
  });
}

export const workspaceSwitchService = {
  async getAvailableWorkspaces(
    email: string,
    currentWorkspaceId: string,
  ): Promise<AvailableWorkspace[]> {
    const users = await prisma.user.findMany({
      where: { email },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
        },
      },
    });

    const workspaces: AvailableWorkspace[] = [];

    for (const user of users) {
      if (user.workspaceId === currentWorkspaceId) continue;

      workspaces.push({
        id: user.workspace.id,
        name: user.workspace.name,
        slug: user.workspace.slug,
        role: user.role,
      });
    }

    return workspaces;
  },

  async switchToWorkspace(input: {
    userId: string;
    email: string;
    currentRole: string;
    targetWorkspaceId: string;
    currentWorkspaceId: string;
  }): Promise<SwitchWorkspaceResult> {
    if (input.targetWorkspaceId === input.currentWorkspaceId) {
      throw new ApiError(400, "Already in this workspace");
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        email: input.email,
        workspaceId: input.targetWorkspaceId,
      },
      include: {
        workspace: {
          select: { id: true, name: true, slug: true, createdAt: true, updatedAt: true },
        },
      },
    });

    if (!targetUser) {
      throw new ApiError(403, "You do not have access to this workspace");
    }

    if (!targetUser.isActive) {
      throw new ApiError(403, "Your account in this workspace is inactive");
    }

    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      workspaceId: targetUser.workspaceId,
    });

    return {
      token,
      workspace: mapWorkspace(targetUser.workspace),
    };
  },
};
