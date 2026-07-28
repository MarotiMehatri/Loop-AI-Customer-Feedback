import { reportRepository } from "./report.repository.js";
import type { ReportPreview, ReportPreviewInput } from "./report.types.js";

function calculatePercentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
}

function countByValue(values: string[]): Array<{ name: string; value: number }> {
  const grouped = new Map<string, number>();

  for (const value of values) {
    const key = value.trim() || "UNKNOWN";
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((first, second) => second.value - first.value);
}

function groupFeedbackByDate(
  dates: Date[],
): ReportPreview["feedbackOverTime"] {
  const grouped = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries())
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([date, value]) => ({ date, value }));
}

export const reportDataService = {
  async createPreview(
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
      (s) => s === "POSITIVE" || s === "POS",
    ).length;

    const negative = sentiments.filter(
      (s) => s === "NEGATIVE" || s === "NEG",
    ).length;

    const neutral = Math.max(totalFeedback - positive - negative, 0);

    return {
      totalFeedback,
      positive,
      neutral,
      negative,
      responseRate: totalFeedback > 0 ? 100 : 0,
      sentimentDistribution: [
        { name: "Positive", value: positive, percentage: calculatePercentage(positive, totalFeedback) },
        { name: "Neutral", value: neutral, percentage: calculatePercentage(neutral, totalFeedback) },
        { name: "Negative", value: negative, percentage: calculatePercentage(negative, totalFeedback) },
      ],
      channelDistribution: countByValue(
        feedback.map((item) => String(item.source ?? "UNKNOWN")),
      ),
      feedbackOverTime: groupFeedbackByDate(
        feedback.map((item) => item.createdAt),
      ),
      topThemes: [],
      generatedAt: new Date(),
    };
  },
};
