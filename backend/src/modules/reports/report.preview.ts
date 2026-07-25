import {
  calculatePercentage,
  countByValue,
  groupFeedbackByDate,
} from "./report.helper.js";

import { reportRepository } from "./report.repository.js";

import type { ReportPreview, ReportPreviewInput } from "./report.types.js";

export async function createReportPreview(
  workspaceId: string,
  input: ReportPreviewInput,
): Promise<ReportPreview> {
  const feedback = await reportRepository.getFeedbackForPreview({
    workspaceId,

    startDate: input.startDate,
    endDate: input.endDate,

    sources: input.filters?.channels ?? input.sources,

    sentiments: input.filters?.sentiments,

    search: input.filters?.search,
  });

  const totalFeedback = feedback.length;

  const sentiments = feedback.map((item) =>
    String(item.sentiment ?? "NEUTRAL").toUpperCase(),
  );

  const positive = sentiments.filter(
    (sentiment) => sentiment === "POSITIVE" || sentiment === "POS",
  ).length;

  const negative = sentiments.filter(
    (sentiment) => sentiment === "NEGATIVE" || sentiment === "NEG",
  ).length;

  const neutral = Math.max(totalFeedback - positive - negative, 0);

  const sentimentDistribution = [
    {
      name: "Positive",
      value: positive,
      percentage: calculatePercentage(positive, totalFeedback),
    },
    {
      name: "Neutral",
      value: neutral,
      percentage: calculatePercentage(neutral, totalFeedback),
    },
    {
      name: "Negative",
      value: negative,
      percentage: calculatePercentage(negative, totalFeedback),
    },
  ];

  const channelDistribution = countByValue(
    feedback.map((item) => String(item.source ?? "UNKNOWN")),
  );

  return {
    totalFeedback,
    positive,
    neutral,
    negative,

    responseRate: totalFeedback > 0 ? 100 : 0,

    sentimentDistribution,

    channelDistribution,

    feedbackOverTime: groupFeedbackByDate(
      feedback.map((item) => item.createdAt),
    ),

    // This can later come from your Theme model.
    topThemes: [],

    generatedAt: new Date(),
  };
}
