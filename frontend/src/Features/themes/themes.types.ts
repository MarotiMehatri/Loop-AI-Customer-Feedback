export type ThemeStatus = "ACTIVE" | "ARCHIVED";
export type ThemeSentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface ThemeRecord {
  id: string;
  name: string;
  description: string | null;
  status: ThemeStatus;
  color: string | null;
  isAiGenerated: boolean;
  feedbackCount: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  mentions: number;
  percentage: number;
  sentiment?: ThemeSentiment;
  sentimentPercentage?: number;
  trend?: number[];
  firstSeen?: string | null;
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

export interface ThemeListResponse {
  items: ThemeRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateThemePayload {
  name: string;
  description?: string | null;
  color?: string | null;
  status?: ThemeStatus;
}

export interface UpdateThemePayload {
  name?: string;
  description?: string | null;
  color?: string | null;
  status?: ThemeStatus;
}

export interface ThemeSentimentItem {
  sentiment: ThemeSentiment;
  count: number;
  percentage: number;
}

export interface ThemeTrendItem {
  period: string;
  count: number;
}

export interface ThemeAnalyticsResponse {
  theme: ThemeRecord;
  totalFeedback: number;
  averageConfidence: number;
  sentiment: ThemeSentimentItem[];
  trend: ThemeTrendItem[];
}

export interface ThemeView extends ThemeRecord {
  sentiment?: ThemeSentiment;
  sentimentPercentage?: number;
  trend?: number[];
}
