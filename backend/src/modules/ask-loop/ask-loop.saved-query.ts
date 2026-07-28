import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import type { SavedQuery, SavedQueryInput } from "./ask-loop.types.js";
import { ASK_LOOP_MESSAGES } from "./ask-loop.constants.js";

export const askLoopSavedQuery = {
  async create(input: SavedQueryInput): Promise<SavedQuery> {
    const query = await prisma.savedAskLoopQuery.create({
      data: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        question: input.question,
        label: input.label ?? null,
      },
    });

    return {
      id: query.id,
      workspaceId: query.workspaceId,
      userId: query.userId,
      question: query.question,
      label: query.label,
      createdAt: query.createdAt,
    };
  },

  async list(workspaceId: string, userId: string): Promise<SavedQuery[]> {
    const queries = await prisma.savedAskLoopQuery.findMany({
      where: { workspaceId, userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return queries.map((q) => ({
      id: q.id,
      workspaceId: q.workspaceId,
      userId: q.userId,
      question: q.question,
      label: q.label,
      createdAt: q.createdAt,
    }));
  },

  async findById(savedQueryId: string, workspaceId: string, userId: string) {
    return prisma.savedAskLoopQuery.findFirst({
      where: { id: savedQueryId, workspaceId, userId },
    });
  },

  async update(
    savedQueryId: string,
    workspaceId: string,
    userId: string,
    data: { label?: string; question?: string },
  ) {
    const existing = await this.findById(savedQueryId, workspaceId, userId);
    if (!existing) {
      throw new ApiError(404, ASK_LOOP_MESSAGES.queryNotFound);
    }

    const updated = await prisma.savedAskLoopQuery.update({
      where: { id: savedQueryId },
      data: {
        ...(data.label !== undefined ? { label: data.label } : {}),
        ...(data.question !== undefined ? { question: data.question } : {}),
      },
    });

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      userId: updated.userId,
      question: updated.question,
      label: updated.label,
      createdAt: updated.createdAt,
    };
  },

  async delete(savedQueryId: string, workspaceId: string, userId: string) {
    const result = await prisma.savedAskLoopQuery.deleteMany({
      where: { id: savedQueryId, workspaceId, userId },
    });

    if (result.count === 0) {
      throw new ApiError(404, ASK_LOOP_MESSAGES.queryNotFound);
    }
  },
};
