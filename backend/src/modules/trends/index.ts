export { trendsRouter } from "./trends.routes.js";
export { trendsController } from "./trends.controller.js";
export { trendsService } from "./trends.service.js";
export { trendDetectionService } from "./trend-detection.service.js";
export { trendInsightService } from "./trend-insight.service.js";
export { trendRepository } from "./trend.repository.js";

export {
  getTrendsSchema,
  getTrendsComparisonSchema,
  detectTrendSchema,
  detectAnomaliesSchema,
  generateForecastSchema,
  generateInsightsSchema,
} from "./trends.validator.js";

export {
  calculateGrowthRate,
  calculateMovingAverage,
  calculateStandardDeviation,
  calculateVolatility,
  calculateTrendDirection,
  calculateSeasonalIndex,
  calculateConfidenceInterval,
  linearRegression,
  detectAnomalies,
} from "./trend.calculator.js";

export {
  assertCanViewTrends,
  assertCanDetectTrends,
  assertCanGenerateInsights,
  assertCanManageTrendSettings,
} from "./trend.permissions.js";

export {
  buildTrendWhere,
  buildTrendOrderBy,
} from "./trend.query.js";

export {
  mapTrendDataPoint,
  mapTrendDataPoints,
  mapDetectionResult,
  mapInsight,
  mapInsights,
  mapForecast,
} from "./trend.mapper.js";

export {
  TREND_DEFAULT_PERIODS,
  TREND_MAX_PERIODS,
  TREND_DEFAULT_LIMIT,
  TREND_MAX_LIMIT,
  TREND_CACHE_TTL_MS,
  TREND_ANOMALY_THRESHOLD,
  TREND_MIN_DATA_POINTS,
  TREND_FORECAST_HORIZON,
  TREND_MESSAGES,
} from "./trend.constants.js";

export type * from "./trends.types.js";
