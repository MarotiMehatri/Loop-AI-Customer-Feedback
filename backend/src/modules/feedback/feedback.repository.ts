// import { prisma } from "../../config/prisma.js";

// import { Prisma, type FeedbackStatus } from "../../generated/prisma/client.js";

// import type {
//   CreateFeedbackInput,
//   FeedbackListFilters,
//   UpdateFeedbackInput,
// } from "./feedback.types.js";

// const feedbackInclude = {
//   createdBy: {
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       avatarUrl: true,
//     },
//   },
// } as const;

// interface CreateFeedbackRepositoryInput extends CreateFeedbackInput {
//   workspaceId: string;
//   createdById: string;
// }

// export const createFeedbackRecord = async (
//   input: CreateFeedbackRepositoryInput,
// ) => {
//   return prisma.feedback.create({
//     data: {
//       source: input.source,
//       sentiment: input.sentiment,
//       status: input.status ?? "NEW",

//       customerName: input.customerName,
//       customerEmail: input.customerEmail,

//       content: input.content,
//       tags: input.tags ?? [],
//       category: input.category,
//       isImportant: input.isImportant ?? false,

//       workspaceId: input.workspaceId,
//       createdById: input.createdById,
//     },

//     include: feedbackInclude,
//   });
// };

// export const findFeedbackById = async (
//   feedbackId: string,
//   workspaceId: string,
// ) => {
//   return prisma.feedback.findFirst({
//     where: {
//       id: feedbackId,
//       workspaceId,
//     },

//     include: feedbackInclude,
//   });
// };

// const createFeedbackWhereInput = (
//   workspaceId: string,
//   filters: FeedbackListFilters,
// ): Prisma.FeedbackWhereInput => {
//   const where: Prisma.FeedbackWhereInput = {
//     workspaceId,
//   };

//   if (filters.source) {
//     where.source = filters.source;
//   }

//   if (filters.sentiment) {
//     where.sentiment = filters.sentiment;
//   }

//   if (filters.status) {
//     where.status = filters.status;
//   }

//   if (filters.category) {
//     where.category = {
//       equals: filters.category,
//       mode: "insensitive",
//     };
//   }

//   if (filters.isImportant !== undefined) {
//     where.isImportant = filters.isImportant;
//   }

//   if (filters.createdFrom || filters.createdTo) {
//     where.createdAt = {
//       ...(filters.createdFrom
//         ? {
//             gte: filters.createdFrom,
//           }
//         : {}),

//       ...(filters.createdTo
//         ? {
//             lte: filters.createdTo,
//           }
//         : {}),
//     };
//   }

//   if (filters.search) {
//     where.OR = [
//       {
//         content: {
//           contains: filters.search,
//           mode: "insensitive",
//         },
//       },
//       {
//         customerName: {
//           contains: filters.search,
//           mode: "insensitive",
//         },
//       },
//       {
//         customerEmail: {
//           contains: filters.search,
//           mode: "insensitive",
//         },
//       },
//       {
//         category: {
//           contains: filters.search,
//           mode: "insensitive",
//         },
//       },
//       {
//         tags: {
//           has: filters.search,
//         },
//       },
//     ];
//   }

//   return where;
// };

// export const findFeedbackList = async (
//   workspaceId: string,
//   filters: FeedbackListFilters,
// ) => {
//   const where = createFeedbackWhereInput(workspaceId, filters);

//   const skip = (filters.page - 1) * filters.limit;

//   const orderBy: Prisma.FeedbackOrderByWithRelationInput = {
//     [filters.sortBy]: filters.sortOrder,
//   };

//   const [feedbacks, totalItems] = await prisma.$transaction([
//     prisma.feedback.findMany({
//       where,
//       skip,
//       take: filters.limit,
//       orderBy,
//       include: feedbackInclude,
//     }),

//     prisma.feedback.count({
//       where,
//     }),
//   ]);

//   return {
//     feedbacks,
//     totalItems,
//   };
// };

// export const updateFeedbackRecord = async (
//   feedbackId: string,
//   workspaceId: string,
//   input: UpdateFeedbackInput,
// ) => {
//   return prisma.feedback.update({
//     where: {
//       id: feedbackId,
//       workspaceId,
//     },

//     data: {
//       source: input.source,
//       sentiment: input.sentiment,
//       status: input.status,

//       customerName: input.customerName,
//       customerEmail: input.customerEmail,

//       content: input.content,
//       tags: input.tags,
//       category: input.category,
//       isImportant: input.isImportant,
//     },

//     include: feedbackInclude,
//   });
// };

// export const updateFeedbackStatusRecord = async (
//   feedbackId: string,
//   workspaceId: string,
//   status: FeedbackStatus,
// ) => {
//   return prisma.feedback.update({
//     where: {
//       id: feedbackId,
//       workspaceId,
//     },

//     data: {
//       status,
//     },

//     include: feedbackInclude,
//   });
// };

// export const deleteFeedbackRecord = async (
//   feedbackId: string,
//   workspaceId: string,
// ) => {
//   return prisma.feedback.delete({
//     where: {
//       id: feedbackId,
//       workspaceId,
//     },
//   });
// };

import type {
  Prisma,
  PrismaClient,
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
} from "../../generated/prisma/client.js";

export class FeedbackRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(
    data: Prisma.FeedbackCreateInput,
  ) {
    return this.prisma.feedback.create({
      data,
    });
  }

  async findById(
    id: string,
    workspaceId: string,
  ) {
    return this.prisma.feedback.findFirst({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async list(
    workspaceId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      source?: FeedbackChannel;
      status?: FeedbackStatus;
      sentiment?: Sentiment;
      category?: string;
    },
  ) {
    const {
      page,
      limit,
      search,
      source,
      status,
      sentiment,
      category,
    } = options;

    const where: Prisma.FeedbackWhereInput = {
      workspaceId,

      ...(source
        ? { source }
        : {}),

      ...(status
        ? { status }
        : {}),

      ...(sentiment
        ? { sentiment }
        : {}),

      ...(category
        ? {
            category: {
              contains: category,
              mode: "insensitive",
            },
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                content: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                customerName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] =
      await Promise.all([
        this.prisma.feedback.findMany({
          where,
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * limit,
          take: limit,
        }),

        this.prisma.feedback.count({
          where,
        }),
      ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    workspaceId: string,
    data: Prisma.FeedbackUpdateInput,
  ) {
    return this.prisma.feedback.updateMany({
      where: {
        id,
        workspaceId,
      },
      data,
    });
  }

  async delete(
    id: string,
    workspaceId: string,
  ) {
    return this.prisma.feedback.deleteMany({
      where: {
        id,
        workspaceId,
      },
    });
  }
}