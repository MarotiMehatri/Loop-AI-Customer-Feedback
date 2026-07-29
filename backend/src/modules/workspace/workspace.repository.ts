import { prisma } from "../../config/prisma.js";

import { buildFeedbackTrendWhere } from "./workspace.query.js";

import type { WorkspaceSummary } from "./workspace.types.js";

const workspaceSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} as const;

const fullWorkspaceSelect = {
  ...workspaceSelect,
  _count: {
    select: {
      users: true,
      feedbacks: true,
    },
  },
  settings: {
    select: {
      general: true,
      ai: true,
      feedback: true,
      reports: true,
      security: true,
      retention: true,
      notifications: true,
    },
  },
};

async function findById(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: workspaceSelect,
  });
}

async function findFullById(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: fullWorkspaceSelect,
  });
}

async function findBySlug(slug: string) {
  return prisma.workspace.findUnique({
    where: { slug },
    select: workspaceSelect,
  });
}

async function create(name: string, slug: string) {
  return prisma.workspace.create({
    data: { name, slug },
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

async function getRecentActivity(
  workspaceId: string,
  limit: number,
) {
  return prisma.activityLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
}

async function getFeedbackTrend(
  workspaceId: string,
  since: Date,
) {
  const where = buildFeedbackTrendWhere(workspaceId, since);

  const feedbacks = await prisma.feedback.findMany({
    where,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return feedbacks;
}

async function getTopThemes(
  workspaceId: string,
  limit: number,
) {
  const themes = await prisma.theme.findMany({
    where: { workspaceId },
    include: {
      _count: {
        select: { feedbackThemes: true },
      },
    },
    orderBy: {
      feedbackThemes: { _count: "desc" },
    },
    take: limit,
  });

  return themes;
}

async function getDepartmentDistribution(workspaceId: string) {
  const groups = await prisma.user.groupBy({
    by: ["department"],
    where: {
      workspaceId,
      department: { not: null },
    },
    _count: { department: true },
    orderBy: { department: "asc" },
  });

  return groups;
}

async function deleteById(workspaceId: string) {
  return prisma.workspace.deleteMany({
    where: { id: workspaceId },
  });
}

async function getSettings(workspaceId: string) {
  return prisma.workspaceSettings.findUnique({
    where: { workspaceId },
  });
}

export const workspaceRepository = {
  findById,
  findFullById,
  findBySlug,
  create,
  updateName,
  getSummary,
  getRecentActivity,
  getFeedbackTrend,
  getTopThemes,
  getDepartmentDistribution,
  deleteById,
  getSettings,
};
