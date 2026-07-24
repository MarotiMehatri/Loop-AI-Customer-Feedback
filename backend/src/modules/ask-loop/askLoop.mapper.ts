import type { AskLoopChart, ParsedAIResponse } from "./askLoop.types.js";

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
    };
  } catch {
    return {
      answer: rawResponse.trim() || "I could not generate a reliable answer.",

      followUpQuestions: [],
    };
  }
}
