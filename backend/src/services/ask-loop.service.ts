import { prisma } from "../lib/prisma.js";

export async function askQuestion(workspaceId: string, question: string, options?: { context?: string; themeId?: string }) {
  const lowerQ = question.toLowerCase();

  const [feedbackStats, recentFeedback, themeBreakdown, sentimentTrend] = await Promise.all([
    prisma.feedback.groupBy({ by: ["status"], where: { workspaceId }, _count: { id: true } }),
    prisma.feedback.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, take: 50, select: { content: true, sentiment: true, channel: true, status: true, createdAt: true, customerName: true } }),
    prisma.theme.findMany({ where: { workspaceId, isActive: true }, include: { _count: { select: { feedbacks: true } } }, orderBy: { feedbacks: { _count: "desc" } } }),
    prisma.feedback.groupBy({ by: ["sentiment"], where: { workspaceId }, _count: { id: true } }),
  ]);

  let themeFeedback: any[] = [];
  if (options?.themeId) {
    themeFeedback = await prisma.feedback.findMany({
      where: { workspaceId, themeId: options.themeId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { content: true, sentiment: true, status: true, createdAt: true },
    });
  }

  const answer = analyzeQuestion(lowerQ, { feedbackStats, recentFeedback, themeBreakdown, sentimentTrend, themeFeedback });

  return {
    question,
    answer,
    data: {
      feedbackStats,
      sentimentDistribution: sentimentTrend,
      topThemes: themeBreakdown.slice(0, 5),
      recentFeedback: recentFeedback.slice(0, 10),
      ...(themeFeedback.length > 0 && { themeSpecificFeedback: themeFeedback }),
    },
    generatedAt: new Date(),
  };
}

function analyzeQuestion(question: string, data: any): string {
  if (question.includes("sentiment") || question.includes("feeling") || question.includes("opinion")) {
    const total = data.sentimentTrend.reduce((sum: number, s: any) => sum + s._count.id, 0);
    const positive = data.sentimentTrend.find((s: any) => s.sentiment === "POSITIVE")?._count.id || 0;
    const negative = data.sentimentTrend.find((s: any) => s.sentiment === "NEGATIVE")?._count.id || 0;
    const neutral = data.sentimentTrend.find((s: any) => s.sentiment === "NEUTRAL")?._count.id || 0;
    return `Based on ${total} feedback entries: ${positive} positive (${total ? Math.round(positive / total * 100) : 0}%), ${negative} negative (${total ? Math.round(negative / total * 100) : 0}%), ${neutral} neutral (${total ? Math.round(neutral / total * 100) : 0}%).`;
  }
  if (question.includes("theme") || question.includes("category") || question.includes("topic")) {
    const themes = data.themeBreakdown.map((t: any) => `${t.name} (${t._count.feedbacks} feedback)`).join(", ");
    return themes ? `Top themes by feedback volume: ${themes}` : "No themes configured yet.";
  }
  if (question.includes("status") || question.includes("review") || question.includes("action")) {
    const statusInfo = data.feedbackStats.map((s: any) => `${s.status}: ${s._count.id}`).join(", ");
    return `Feedback status breakdown: ${statusInfo}`;
  }
  if (question.includes("channel") || question.includes("source") || question.includes("where")) {
    const channels = data.recentFeedback.reduce((acc: any, f: any) => { acc[f.channel] = (acc[f.channel] || 0) + 1; return acc; }, {});
    const channelInfo = Object.entries(channels).map(([ch, count]) => `${ch}: ${count}`).join(", ");
    return `Feedback by channel: ${channelInfo || "No data"}`;
  }
  if (question.includes("recent") || question.includes("latest") || question.includes("new")) {
    const recent = data.recentFeedback.slice(0, 5).map((f: any) => `- "${f.content.substring(0, 80)}..." (${f.sentiment}, ${f.channel})`).join("\n");
    return recent ? `Recent feedback:\n${recent}` : "No recent feedback found.";
  }
  if (question.includes("trend") || question.includes("over time") || question.includes("change")) {
    return `Sentiment trend analysis: ${data.sentimentTrend.map((s: any) => `${s.sentiment}: ${s._count.id} entries`).join(", ")}. For detailed trend analysis, consider implementing time-series tracking.`;
  }
  const total = data.feedbackStats.reduce((sum: number, s: any) => sum + s._count.id, 0);
  const topTheme = data.themeBreakdown[0];
  return `Overview: ${total} total feedback entries. Top theme: ${topTheme ? `${topTheme.name} (${topTheme._count.feedbacks} entries)` : "None yet"}. Feedback is spread across ${data.themeBreakdown.length} themes. Ask about sentiment, themes, status, channels, or recent feedback for more specific insights.`;
}
