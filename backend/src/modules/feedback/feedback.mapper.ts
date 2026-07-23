interface FeedbackRecord {
  id: string;
  source: string;
  sentiment: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  content: string;
  tags: string[];
  category: string | null;
  isImportant: boolean;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export const mapFeedbackResponse = (feedback: FeedbackRecord) => {
  return {
    id: feedback.id,
    source: feedback.source,
    sentiment: feedback.sentiment,
    status: feedback.status,

    customer: {
      name: feedback.customerName,
      email: feedback.customerEmail,
    },

    content: feedback.content,
    tags: feedback.tags,
    category: feedback.category,
    isImportant: feedback.isImportant,

    workspaceId: feedback.workspaceId,

    createdBy: feedback.createdBy
      ? {
          id: feedback.createdBy.id,
          name: feedback.createdBy.name,
          email: feedback.createdBy.email,
          avatarUrl: feedback.createdBy.avatarUrl,
        }
      : {
          id: feedback.createdById,
        },

    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
};
