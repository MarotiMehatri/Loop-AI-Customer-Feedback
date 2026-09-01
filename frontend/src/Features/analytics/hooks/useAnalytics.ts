import { useQuery } from "@tanstack/react-query";

import {
  getAnalytics,
  type AnalyticsQuery,
} from "../api/analytics.api";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}

function toNumber(value: unknown): number {
  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
}

/**
 * Extract the actual API payload.
 *
 * getAnalytics() normally returns the API payload directly.
 * This helper also safely handles an Axios-style { data: ... }
 * response if your API client happens to return one.
 */
function getPayload(response: unknown): UnknownRecord {
  const root = asRecord(response);

  if (
    root.data !== undefined &&
    typeof root.data === "object" &&
    root.data !== null
  ) {
    return asRecord(root.data);
  }

  return root;
}

/**
 * Main analytics query.
 */
export function useAnalytics(
  query: AnalyticsQuery = {},
) {
  return useQuery({
    queryKey: ["analytics", query],

    queryFn: () => getAnalytics(query),

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });
}

/**
 * Get feedback count for a specific inbox status.
 *
 * Examples:
 *
 * useInboxStatusCount("NEW")
 * useInboxStatusCount("REVIEWED")
 * useInboxStatusCount("ACTIONED")
 * useInboxStatusCount("ARCHIVED")
 */
export function useInboxStatusCount(
  status: string,
  query: AnalyticsQuery = {},
) {
  return useQuery({
    queryKey: [
      "analytics",
      "inbox-status",
      status,
      query,
    ],

    queryFn: async () => {
      const response = await getAnalytics({
        ...query,
        status,
      });

      const data = getPayload(response);

      /*
       * Supported response shapes:
       *
       * {
       *   count: 10
       * }
       *
       * {
       *   total: 10
       * }
       *
       * {
       *   overview: {
       *     totalFeedback: 10
       *   }
       * }
       *
       * {
       *   statusCount: 10
       * }
       *
       * {
       *   status: {
       *     count: 10
       *   }
       * }
       */

      if (typeof data.count === "number") {
        return data.count;
      }

      if (typeof data.total === "number") {
        return data.total;
      }

      if (typeof data.statusCount === "number") {
        return data.statusCount;
      }

      const statusData = asRecord(data.status);

      if (typeof statusData.count === "number") {
        return statusData.count;
      }

      const overview = asRecord(data.overview);

      if (typeof overview.totalFeedback === "number") {
        return overview.totalFeedback;
      }

      return 0;
    },

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });
}

/**
 * Get total classified feedback count.
 */
export function useClassificationsCount(
  query: AnalyticsQuery = {},
) {
  return useQuery({
    queryKey: [
      "analytics",
      "classifications",
      query,
    ],

    queryFn: async () => {
      const response = await getAnalytics(query);

      const data = getPayload(response);

      /*
       * Supported response shapes:
       *
       * {
       *   classified: 100
       * }
       *
       * {
       *   classifiedCount: 100
       * }
       *
       * {
       *   classificationsCount: 100
       * }
       *
       * {
       *   classificationOverview: {
       *     autoClassified: 100
       *   }
       * }
       */

      if (typeof data.classified === "number") {
        return data.classified;
      }

      if (typeof data.classifiedCount === "number") {
        return data.classifiedCount;
      }

      if (typeof data.classificationsCount === "number") {
        return data.classificationsCount;
      }

      const classificationOverview = asRecord(
        data.classificationOverview,
      );

      if (
        typeof classificationOverview.autoClassified ===
        "number"
      ) {
        return classificationOverview.autoClassified;
      }

      if (
        typeof classificationOverview.classified ===
        "number"
      ) {
        return classificationOverview.classified;
      }

      const classifications = asRecord(
        data.classifications,
      );

      if (
        typeof classifications.count === "number"
      ) {
        return classifications.count;
      }

      return 0;
    },

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });
}