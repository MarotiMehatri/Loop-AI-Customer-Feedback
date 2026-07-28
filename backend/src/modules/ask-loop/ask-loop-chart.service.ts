import type { Prisma } from "../../generated/prisma/client.js";
import type { AskLoopChart, AskLoopChartType } from "./ask-loop.types.js";

export const askLoopChartService = {
  parseChart(value: unknown): AskLoopChart | undefined {
    if (!value || typeof value !== "object") return undefined;

    const chart = value as Record<string, unknown>;
    const validTypes = ["bar", "line", "pie", "none"];
    const type =
      typeof chart.type === "string" && validTypes.includes(chart.type)
        ? (chart.type as AskLoopChartType)
        : "none";

    const labels = Array.isArray(chart.labels) ? chart.labels.map(String) : [];
    const values = Array.isArray(chart.values)
      ? chart.values
          .map((v) => Number(v))
          .filter((v) => Number.isFinite(v))
      : [];

    return {
      type,
      title: typeof chart.title === "string" ? chart.title : "",
      labels,
      values,
    };
  },

  toPrismaJson(chart: AskLoopChart | undefined): Prisma.InputJsonValue | undefined {
    if (!chart) return undefined;

    return {
      type: chart.type,
      title: chart.title,
      labels: chart.labels,
      values: chart.values,
    } as Prisma.InputJsonValue;
  },

  validateChartData(chart: AskLoopChart): string | null {
    if (chart.labels.length !== chart.values.length) {
      return "Labels and values arrays must have the same length";
    }

    if (chart.values.some((v) => v < 0 && chart.type === "pie")) {
      return "Pie chart values cannot be negative";
    }

    return null;
  },
};
