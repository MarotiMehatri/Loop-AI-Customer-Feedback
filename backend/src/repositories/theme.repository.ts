import { prisma } from "../lib/prisma.js";

export async function findMany(ws: string, filters: { page: number; limit: number; search?: string; isActive?: boolean }) {
  const { page, limit, search, isActive } = filters;
  const skip = (page - 1) * limit;

  const where: any = { workspaceId: ws };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [themes, total] = await Promise.all([
    prisma.theme.findMany({
      where,
      include: { _count: { select: { feedbacks: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.theme.count({ where }),
  ]);

  return { themes, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findById(id: string, ws: string) {
  return prisma.theme.findFirst({
    where: { id, workspaceId: ws },
    include: { _count: { select: { feedbacks: true } } },
  });
}

export async function create(data: { workspaceId: string; name: string; description?: string; color?: string; isActive?: boolean }) {
  return prisma.theme.create({ data });
}

export async function update(id: string, ws: string, data: { name?: string; description?: string; color?: string; isActive?: boolean }) {
  return prisma.theme.update({
    where: { id },
    data,
  });
}

export async function deleteTheme(id: string, ws: string) {
  await prisma.theme.delete({
    where: { id },
  });
}

export async function getStats(ws: string) {
  const [total, activeCount, feedbackCounts] = await Promise.all([
    prisma.theme.count({ where: { workspaceId: ws } }),
    prisma.theme.count({ where: { workspaceId: ws, isActive: true } }),
    prisma.theme.findMany({
      where: { workspaceId: ws },
      select: { id: true, name: true, _count: { select: { feedbacks: true } } },
      orderBy: { feedbacks: { _count: "desc" } },
    }),
  ]);

  return { total, activeCount, feedbackCounts };
}
