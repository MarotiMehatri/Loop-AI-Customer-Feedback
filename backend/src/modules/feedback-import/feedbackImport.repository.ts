import type { ImportStatus, Prisma } from "../../generated/prisma/client.js";

import { prisma } from "../../config/prisma.js";

interface CreateImportRecordInput {
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  workspaceId: string;
  importedById: string;
}

export const createImportRecord = (input: CreateImportRecordInput) => {
  return prisma.feedbackImport.create({
    data: {
      fileName: input.fileName,
      originalName: input.originalName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      workspaceId: input.workspaceId,
      importedById: input.importedById,
    },
  });
};

export const updateImportStatus = (
  importId: string,
  data: {
    status: ImportStatus;
    totalRows?: number;
    successfulRows?: number;
    failedRows?: number;
    duplicateRows?: number;
    startedAt?: Date;
    completedAt?: Date;
    errorMessage?: string | null;
  },
) => {
  return prisma.feedbackImport.update({
    where: {
      id: importId,
    },
    data,
  });
};

export const createImportedFeedback = (
  data: Prisma.FeedbackCreateManyInput[],
) => {
  return prisma.feedback.createMany({
    data,
    skipDuplicates: true,
  });
};

export const createImportErrors = (
  errors: Prisma.FeedbackImportErrorCreateManyInput[],
) => {
  if (errors.length === 0) {
    return null;
  }

  return prisma.feedbackImportError.createMany({
    data: errors,
  });
};

export const findImportById = (importId: string, workspaceId: string) => {
  return prisma.feedbackImport.findFirst({
    where: {
      id: importId,
      workspaceId,
    },

    include: {
      importedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      errors: {
        orderBy: {
          rowNumber: "asc",
        },

        take: 100,
      },
    },
  });
};

export const findImportHistory = async (
  workspaceId: string,
  input: {
    page: number;
    limit: number;
    status?: ImportStatus;
  },
) => {
  const where: Prisma.FeedbackImportWhereInput = {
    workspaceId,
    status: input.status,
  };

  const skip = (input.page - 1) * input.limit;

  const [items, total] = await prisma.$transaction([
    prisma.feedbackImport.findMany({
      where,
      skip,
      take: input.limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        importedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.feedbackImport.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
};

export const deleteImportRecord = (importId: string) => {
  return prisma.feedbackImport.delete({
    where: {
      id: importId,
    },
  });
};
