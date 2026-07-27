export { trendsRouter } from "./trends.routes.js";

export {
  getTrends,
  getTrendsComparison,
} from "./trends.service.js";

export type {
  GetTrendsComparisonQuery,
  GetTrendsQuery,
  TrendDataPoint,
  TrendMetric,
  TrendPeriod,
  TrendResult,
  TrendSummary,
} from "./trends.types.js";
