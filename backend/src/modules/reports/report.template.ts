import {
  DEFAULT_REPORT_CHARTS,
  DEFAULT_REPORT_METRICS,
  DEFAULT_REPORT_SOURCES,
} from "./report.constants.js";

import type { CreateReportInput, ReportTemplateData } from "./report.types.js";

export const DEFAULT_REPORT_TEMPLATE: ReportTemplateData = {
  name: "Weekly Voice of Customer Report",

  description: "Weekly customer feedback summary",

  type: "VOICE_OF_CUSTOMER",

  sources: [...DEFAULT_REPORT_SOURCES],

  metrics: [...DEFAULT_REPORT_METRICS],

  charts: DEFAULT_REPORT_CHARTS.map((chart) => ({ ...chart })),

  tags: ["weekly", "voice-of-customer"],
};

export function applyReportTemplate(
  template: ReportTemplateData,
  title?: string,
): CreateReportInput {
  return {
    title: title ?? template.name,
    description: template.description,
    type: template.type,
    sources: [...template.sources],
    filters: template.filters,
    metrics: [...template.metrics],
    charts: template.charts
      ? template.charts.map((chart) => ({
          ...chart,
        }))
      : undefined,
    tags: template.tags ? [...template.tags] : [],
    saveAsTemplate: false,
  };
}

export function createTemplateFromReport(
  report: CreateReportInput,
  templateName: string,
): ReportTemplateData {
  return {
    name: templateName,
    description: report.description,
    type: report.type,
    sources: [...report.sources],
    filters: report.filters,
    metrics: [...report.metrics],
    charts: report.charts,
    tags: report.tags,
  };
}
