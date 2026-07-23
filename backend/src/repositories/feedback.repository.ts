import { prisma } from "../lib/prisma.js";
import { Prisma, FeedbackStatus } from "../generated/prisma/client.js";

interface FeedbackFilters {
  page?: number;
  limit?: number;
  status?: string;
  sentiment?: string;
  channel?: string;
  themeId?: string;
  search?: string;
}

export async function findMany(ws: string, filters: FeedbackFilters) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.FeedbackWhereInput = { workspaceId: ws };
  if (filters.status) where.status = filters.status as FeedbackStatus;
  if (filters.sentiment) where.sentiment = filters.sentiment as any;
  if (filters.channel) where.channel = filters.channel as any;
  if (filters.themeId) where.themeId = filters.themeId;
  if (filters.search) where.content = { contains: filters.search, mode: "insensitive" };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { theme: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return { feedbacks, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findById(id: string, ws: string) {
  return prisma.feedback.findFirst({
    where: { id, workspaceId: ws },
    include: { theme: { select: { id: true, name: true, color: true } } },
  });
}

export async function create(data: {
  workspaceId: string;
  content: string;
  channel?: string;
  sentiment?: string;
  sentimentScore?: number;
  status?: string;
  customerName?: string;
  customerEmail?: string;
  tags?: string[];
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
  themeId?: string;
}) {
  return prisma.feedback.create({
    data: {
      workspaceId: data.workspaceId,
      content: data.content,
      channel: (data.channel as any) || "DIRECT",
      sentiment: (data.sentiment as any) || "NEUTRAL",
      sentimentScore: data.sentimentScore,
      status: (data.status as any) || "NEW",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      tags: data.tags || [],
      sourceUrl: data.sourceUrl,
      metadata: data.metadata as any,
      themeId: data.themeId,
    },
  });
}

export async function update(id: string, ws: string, data: Record<string, unknown>) {
  return prisma.feedback.updateMany({
    where: { id, workspaceId: ws },
    data,
  });
}

export async function updateStatus(id: string, ws: string, status: string) {
  return prisma.feedback.updateMany({
    where: { id, workspaceId: ws },
    data: { status: status as FeedbackStatus },
  });
}

export async function deleteFeedback(id: string, ws: string) {
  return prisma.feedback.deleteMany({
    where: { id, workspaceId: ws },
  });
}

export async function bulkCreate(ws: string, items: Array<Record<string, unknown>>) {
  const data = items.map((item) => ({
    workspaceId: ws,
    content: String(item.content || ""),
    channel: (item.channel as any) || "DIRECT",
    sentiment: (item.sentiment as any) || "NEUTRAL",
    sentimentScore: item.sentimentScore as number | undefined,
    status: "NEW" as const,
    customerName: item.customerName as string | undefined,
    customerEmail: item.customerEmail as string | undefined,
    tags: (item.tags as string[]) || [],
    sourceUrl: item.sourceUrl as string | undefined,
    metadata: item.metadata as any,
    themeId: item.themeId as string | undefined,
  }));

  const result = await prisma.feedback.createMany({ data, skipDuplicates: true });
  return result.count;
}

export async function getStats(ws: string) {
  const [total, byStatus, bySentiment, byChannel, recentCount] = await Promise.all([
    prisma.feedback.count({ where: { workspaceId: ws } }),
    prisma.feedback.groupBy({ by: ["status"], where: { workspaceId: ws }, _count: { id: true } }),
    prisma.feedback.groupBy({ by: ["sentiment"], where: { workspaceId: ws }, _count: { id: true } }),
    prisma.feedback.groupBy({ by: ["channel"], where: { workspaceId: ws }, _count: { id: true } }),
    prisma.feedback.count({
      where: {
        workspaceId: ws,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    total,
    recentWeek: recentCount,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
    bySentiment: bySentiment.map((s) => ({ sentiment: s.sentiment, count: s._count.id })),
    byChannel: byChannel.map((c) => ({ channel: c.channel, count: c._count.id })),
  };
}

export async function searchByContent(ws: string, query: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where: Prisma.FeedbackWhereInput = {
    workspaceId: ws,
    content: { contains: query, mode: "insensitive" },
  };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      include: { theme: { select: { id: true, name: true, color: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feedback.count({ where }),
  ]);

  return { feedbacks, total, page, limit, totalPages: Math.ceil(total / limit) };
}
