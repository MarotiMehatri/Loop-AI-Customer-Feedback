import type { AskLoopChart, ParsedAIResponse, AskLoopCitation } from "./ask-loop.types.js";

function parseChart(value: unknown): AskLoopChart | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const chart = value as Record<string, unknown>;
  const validTypes = ["bar", "line", "pie", "none"];
  const type =
    typeof chart.type === "string" && validTypes.includes(chart.type)
      ? (chart.type as AskLoopChart["type"])
      : "none";

  const labels = Array.isArray(chart.labels) ? chart.labels.map(String) : [];
  const values = Array.isArray(chart.values)
    ? chart.values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
    : [];

  return {
    type,
    title: typeof chart.title === "string" ? chart.title : "",
    labels,
    values,
  };
}

function parseCitations(value: unknown): AskLoopCitation[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const citations = value
    .filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null,
    )
    .map((item) => ({
      feedbackId: String(item.feedbackId ?? ""),
      content: String(item.content ?? ""),
      sentiment: String(item.sentiment ?? ""),
      source: String(item.source ?? ""),
      relevance: Number(item.relevance ?? 0),
    }))
    .filter((c) => c.feedbackId.length > 0 && c.content.length > 0);

  return citations.length > 0 ? citations : undefined;
}

export function parseAskLoopResponse(rawResponse: string): ParsedAIResponse {
  try {
    const parsed = JSON.parse(rawResponse) as Record<string, unknown>;

    return {
      answer:
        typeof parsed.answer === "string"
          ? parsed.answer
          : "I could not generate a reliable answer.",

      summary: typeof parsed.summary === "string" ? parsed.summary : undefined,

      chart: parseChart(parsed.chart),

      followUpQuestions: Array.isArray(parsed.followUpQuestions)
        ? parsed.followUpQuestions
            .filter((item): item is string => typeof item === "string")
            .slice(0, 4)
        : [],

      citations: parseCitations(parsed.citations),
    };
  } catch {
    return {
      answer: rawResponse.trim() || "I could not generate a reliable answer.",
      followUpQuestions: [],
    };
  }
}

export function mapChartToJsonValue(chart: AskLoopChart | undefined): Record<string, unknown> | undefined {
  if (!chart) return undefined;

  return {
    type: chart.type,
    title: chart.title,
    labels: chart.labels,
    values: chart.values,
  } as Record<string, unknown>;
}

export function mapMetadataToJsonValue(metadata: {
  summary?: string | null;
  followUpQuestions?: string[];
  model?: string;
  totalTokens?: number | null;
}): Record<string, unknown> {
  return {
    summary: metadata.summary ?? null,
    followUpQuestions: metadata.followUpQuestions ?? [],
    model: metadata.model ?? null,
    totalTokens: metadata.totalTokens ?? null,
  };
}
