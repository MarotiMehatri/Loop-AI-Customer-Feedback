import type { Role, ThemeStatus } from "../../generated/prisma/client.js";

export type ThemeSortField = "name" | "status" | "createdAt" | "updatedAt";

export type ThemeSortOrder = "asc" | "desc";

export interface ThemeContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface CreateThemeInput {
  name: string;
  description?: string | null;
  color?: string | null;
  status?: ThemeStatus;
}

export interface UpdateThemeInput {
  name?: string;
  description?: string | null;
  color?: string | null;
  status?: ThemeStatus;
}

export interface ThemeListQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ThemeStatus;
  isAiGenerated?: boolean;
  sortBy: ThemeSortField;
  sortOrder: ThemeSortOrder;
}

export interface ThemeFeedbackQuery {
  page: number;
  limit: number;
}

export interface AssignFeedbackInput {
  confidence?: number;
}

export interface GenerateThemesInput {
  maxThemes: number;
  minClusterSize: number;
  feedbackLimit: number;
}

export interface ThemeResponse {
  id: string;
  name: string;
  description: string | null;
  status: ThemeStatus;
  color: string | null;
  isAiGenerated: boolean;
  feedbackCount: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeFeedbackResponse {
  feedbackId: string;
  content: string;
  sentiment: string;
  confidence: number;
  createdAt: Date;
}

export interface ThemeSummaryItem {
  status: ThemeStatus;
  count: number;
}

export interface ThemeSummaryResponse {
  totalThemes: number;
  activeAssignments: number;
  aiGeneratedThemes: number;
  manuallyCreatedThemes: number;
  byStatus: ThemeSummaryItem[];
}

export interface ThemeSentimentItem {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface ThemeTrendItem {
  period: string;
  count: number;
}

export interface ThemeAnalyticsResponse {
  theme: ThemeResponse;
  totalFeedback: number;
  averageConfidence: number;
  sentiment: ThemeSentimentItem[];
  trend: ThemeTrendItem[];
}

export interface ThemeAiFeedback {
  id: string;
  content: string;
}

export interface ThemeAiCandidate {
  name: string;
  description: string;
  color: string;
  confidence: number;
  feedbackIds: string[];
}

export interface ThemeAiProviderInput {
  feedback: ThemeAiFeedback[];
  existingThemeNames: string[];
  maxThemes: number;
  minClusterSize: number;
}

export type ThemeAiProvider = (
  input: ThemeAiProviderInput,
) => Promise<ThemeAiCandidate[]>;

export interface ThemeGenerationResponse {
  generatedCount: number;
  analyzedFeedbackCount: number;
  themes: ThemeResponse[];
}
