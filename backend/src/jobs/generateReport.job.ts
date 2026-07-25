import { reportService } from "../modules/reports/report.service.js";

export interface GenerateReportJobInput {
  reportId: string;
  workspaceId: string;
  userId: string;
}

export async function runGenerateReportJob(
  input: GenerateReportJobInput,
): Promise<void> {
  await reportService.generate(input.reportId, input.workspaceId, input.userId);
}
