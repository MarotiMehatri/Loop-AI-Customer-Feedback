import { prisma } from "../../config/prisma.js";
import type { WorkspaceSummary } from "./workspace.types.js";

const workspaceSelect = {
  id: true,
  name: true,
  createdAt: true,
} as const;

async function findById(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: workspaceSelect,
  });
}

async function updateName(workspaceId: string, name: string) {
  const result = await prisma.workspace.updateMany({
    where: { id: workspaceId },
    data: { name },
  });

  if (result.count === 0) return null;
  return findById(workspaceId);
}

async function getSummary(workspaceId: string): Promise<WorkspaceSummary> {
  const [members, activeMembers, feedback, themes, reports] =
    await prisma.$transaction([
      prisma.user.count({ where: { workspaceId } }),
      prisma.user.count({ where: { workspaceId, isActive: true } }),
      prisma.feedback.count({ where: { workspaceId } }),
      prisma.theme.count({ where: { workspaceId } }),
      prisma.report.count({ where: { workspaceId } }),
    ]);

  return { members, activeMembers, feedback, themes, reports };
}

async function deleteById(workspaceId: string) {
  return prisma.workspace.deleteMany({
    where: { id: workspaceId },
  });
}

export const workspaceRepository = {
  findById,
  updateName,
  getSummary,
  deleteById,
};
