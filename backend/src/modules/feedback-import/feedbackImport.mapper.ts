import {
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
} from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import type {
  CsvFeedbackRow,
  NormalizedFeedbackRow,
} from "./feedbackImport.types.js";

const sourceAliases: Record<string, FeedbackChannel> = {
  support: FeedbackChannel.SUPPORT,
  "support ticket": FeedbackChannel.SUPPORT,
  app_store: FeedbackChannel.APP_STORE,
  "app store": FeedbackChannel.APP_STORE,
  survey: FeedbackChannel.SURVEY,
  sales: FeedbackChannel.SALES,
  social: FeedbackChannel.SOCIAL,
  website: FeedbackChannel.WEBSITE,
  email: FeedbackChannel.EMAIL,
  manual: FeedbackChannel.MANUAL,
};

const statusAliases: Record<string, FeedbackStatus> = {
  new: FeedbackStatus.NEW,
  reviewed: FeedbackStatus.REVIEWED,
  actioned: FeedbackStatus.ACTIONED,
  archived: FeedbackStatus.ARCHIVED,
};

const parseSource = (source: string | undefined): FeedbackChannel => {
  if (!source) {
    throw new ApiError(400, "Feedback source is required");
  }

  const normalizedSource = source.trim().toLowerCase();

  const result = sourceAliases[normalizedSource];

  if (!result) {
    throw new ApiError(400, `Unsupported feedback source: ${source}`);
  }

  return result;
};

const parseSentiment = (sentiment: string | undefined): Sentiment => {
  if (!sentiment?.trim()) {
    return Sentiment.NEUTRAL;
  }

  const normalized = sentiment.trim().toLowerCase();

  switch (normalized) {
    case "positive":
    case "pos":
      return Sentiment.POSITIVE;

    case "negative":
    case "neg":
      return Sentiment.NEGATIVE;

    case "neutral":
    case "neu":
      return Sentiment.NEUTRAL;

    default:
      return Sentiment.NEUTRAL;
  }
};

const parseStatus = (status: string | undefined): FeedbackStatus => {
  if (!status?.trim()) {
    return FeedbackStatus.NEW;
  }

  const result = statusAliases[status.trim().toLowerCase()];

  if (!result) {
    throw new ApiError(400, `Unsupported feedback status: ${status}`);
  }

  return result;
};

const parseTags = (tags: string | undefined): string[] => {
  if (!tags?.trim()) {
    return [];
  }

  return Array.from(
    new Set(
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  );
};

export const mapCsvRowToFeedback = (
  row: CsvFeedbackRow,
): NormalizedFeedbackRow => {
  const content = row.content?.trim();

  if (!content) {
    throw new ApiError(400, "Feedback content is required");
  }

  return {
    content,
    source: parseSource(row.source),
    customerName: row.customerName?.trim() || null,

    customerEmail: row.customerEmail?.trim().toLowerCase() || null,

    sentiment: parseSentiment(row.sentiment),
    status: parseStatus(row.status),
    category: row.category?.trim() || null,
    tags: parseTags(row.tags),

    createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
  };
};
