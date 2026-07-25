import type { Role } from "../generated/prisma/client.js";

import { logger } from "../config/logger.js";

import { themeService } from "../modules/themes/theme.service.js";

export interface ClusterThemesJobInput {
  userId: string;
  workspaceId: string;
  role: Role;

  maxThemes?: number;
  minClusterSize?: number;
  feedbackLimit?: number;
}

export interface ClusterThemesJobResult {
  generatedCount: number;
  analyzedFeedbackCount: number;
}

function validateInput(input: ClusterThemesJobInput): void {
  if (!input.userId) {
    throw new Error("User ID is required for theme clustering");
  }

  if (!input.workspaceId) {
    throw new Error("Workspace ID is required for theme clustering");
  }
}

export async function runClusterThemesJob(
  input: ClusterThemesJobInput,
): Promise<ClusterThemesJobResult> {
  validateInput(input);

  try {
    logger.info(
      `[ClusterThemesJob] Starting theme clustering for workspace ${input.workspaceId}`,
    );

    const result = await themeService.generate(
      {
        userId: input.userId,
        workspaceId: input.workspaceId,
        role: input.role,
      },
      {
        maxThemes: input.maxThemes ?? 10,

        minClusterSize: input.minClusterSize ?? 2,

        feedbackLimit: input.feedbackLimit ?? 500,
      },
    );

    logger.info(
      `[ClusterThemesJob] Generated ${result.generatedCount} themes from ${result.analyzedFeedbackCount} feedback records`,
    );

    return {
      generatedCount: result.generatedCount,

      analyzedFeedbackCount: result.analyzedFeedbackCount,
    };
  } catch (error) {
    logger.error(
      `[ClusterThemesJob] Theme clustering failed for workspace ${input.workspaceId}`,
      error,
    );

    throw error;
  }
}
