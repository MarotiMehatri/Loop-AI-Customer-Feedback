export const TREND_DEFAULT_PERIODS = 30;
export const TREND_MAX_PERIODS = 365;
export const TREND_DEFAULT_LIMIT = 20;
export const TREND_MAX_LIMIT = 100;
export const TREND_CACHE_TTL_MS = 5 * 60 * 1000;
export const TREND_ANOMALY_THRESHOLD = 2;
export const TREND_MIN_DATA_POINTS = 5;
export const TREND_FORECAST_HORIZON = 7;

export const TREND_MESSAGES = {
  listed: "Trends retrieved successfully",
  comparisonRetrieved: "Trend comparison retrieved successfully",
  retrieved: "Trend data retrieved successfully",
  detectionCompleted: "Trend detection completed successfully",
  insightsGenerated: "Trend insights generated successfully",
  anomaliesDetected: "Trend anomalies detected successfully",
  forecastGenerated: "Trend forecast generated successfully",
  notFound: "Trend data not found",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  forbidden: "You do not have permission to access trend data",
  insufficientData: "Insufficient data points for trend analysis",
} as const;
