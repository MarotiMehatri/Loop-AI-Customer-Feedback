import type { AskLoopContext } from "./askLoop.types.js";

export function buildAskLoopContext(context: AskLoopContext): string {
  return JSON.stringify(
    {
      totalFeedback: context.totalFeedback,

      sentimentDistribution: context.sentiment,

      sourceDistribution: context.sources,

      categoryDistribution: context.categories,

      topThemes: context.themes,

      recentFeedback: context.recentFeedback.map((feedback) => ({
        content: feedback.content,
        sentiment: feedback.sentiment,
        source: feedback.source,
        category: feedback.category,
        createdAt: feedback.createdAt.toISOString(),
      })),
    },
    null,
    2,
  );
}
