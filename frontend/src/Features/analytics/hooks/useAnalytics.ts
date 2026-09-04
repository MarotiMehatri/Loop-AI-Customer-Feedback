// import { useQuery } from "@tanstack/react-query";

// import {
//   getAnalytics,
//   type AnalyticsQuery,
// } from "../api/analytics.api";

// type UnknownRecord = Record<string, unknown>;

// function asRecord(value: unknown): UnknownRecord {
//   if (
//     value !== null &&
//     typeof value === "object" &&
//     !Array.isArray(value)
//   ) {
//     return value as UnknownRecord;
//   }

//   return {};
// }

// function toNumber(value: unknown): number {
//   const result = Number(value);

//   return Number.isFinite(result) ? result : 0;
// }

// /**
//  * Extract the actual API payload.
//  *
//  * getAnalytics() normally returns the API payload directly.
//  * This helper also safely handles an Axios-style { data: ... }
//  * response if your API client happens to return one.
//  */
// function getPayload(response: unknown): UnknownRecord {
//   const root = asRecord(response);

//   if (
//     root.data !== undefined &&
//     typeof root.data === "object" &&
//     root.data !== null
//   ) {
//     return asRecord(root.data);
//   }

//   return root;
// }

// /**
//  * Main analytics query.
//  */
// export function useAnalytics(
//   query: AnalyticsQuery = {},
// ) {
//   return useQuery({
//     queryKey: ["analytics", query],

//     queryFn: () => getAnalytics(query),

//     staleTime: 30_000,

//     refetchOnWindowFocus: false,
//   });
// }

// /**
//  * Get feedback count for a specific inbox status.
//  *
//  * Examples:
//  *
//  * useInboxStatusCount("NEW")
//  * useInboxStatusCount("REVIEWED")
//  * useInboxStatusCount("ACTIONED")
//  * useInboxStatusCount("ARCHIVED")
//  */
// export function useInboxStatusCount(
//   status: string,
//   query: AnalyticsQuery = {},
// ) {
//   return useQuery({
//     queryKey: [
//       "analytics",
//       "inbox-status",
//       status,
//       query,
//     ],

//     queryFn: async () => {
//       const response = await getAnalytics({
//         ...query,
//         status,
//       });

//       const data = getPayload(response);

//       /*
//        * Supported response shapes:
//        *
//        * {
//        *   count: 10
//        * }
//        *
//        * {
//        *   total: 10
//        * }
//        *
//        * {
//        *   overview: {
//        *     totalFeedback: 10
//        *   }
//        * }
//        *
//        * {
//        *   statusCount: 10
//        * }
//        *
//        * {
//        *   status: {
//        *     count: 10
//        *   }
//        * }
//        */

//       if (typeof data.count === "number") {
//         return data.count;
//       }

//       if (typeof data.total === "number") {
//         return data.total;
//       }

//       if (typeof data.statusCount === "number") {
//         return data.statusCount;
//       }

//       const statusData = asRecord(data.status);

//       if (typeof statusData.count === "number") {
//         return statusData.count;
//       }

//       const overview = asRecord(data.overview);

//       if (typeof overview.totalFeedback === "number") {
//         return overview.totalFeedback;
//       }

//       return 0;
//     },

//     staleTime: 30_000,

//     refetchOnWindowFocus: false,
//   });
// }

// /**
//  * Get total classified feedback count.
//  */
// export function useClassificationsCount(
//   query: AnalyticsQuery = {},
// ) {
//   return useQuery({
//     queryKey: [
//       "analytics",
//       "classifications",
//       query,
//     ],

//     queryFn: async () => {
//       const response = await getAnalytics(query);

//       const data = getPayload(response);

//       /*
//        * Supported response shapes:
//        *
//        * {
//        *   classified: 100
//        * }
//        *
//        * {
//        *   classifiedCount: 100
//        * }
//        *
//        * {
//        *   classificationsCount: 100
//        * }
//        *
//        * {
//        *   classificationOverview: {
//        *     autoClassified: 100
//        *   }
//        * }
//        */

//       if (typeof data.classified === "number") {
//         return data.classified;
//       }

//       if (typeof data.classifiedCount === "number") {
//         return data.classifiedCount;
//       }

//       if (typeof data.classificationsCount === "number") {
//         return data.classificationsCount;
//       }

//       const classificationOverview = asRecord(
//         data.classificationOverview,
//       );

//       if (
//         typeof classificationOverview.autoClassified ===
//         "number"
//       ) {
//         return classificationOverview.autoClassified;
//       }

//       if (
//         typeof classificationOverview.classified ===
//         "number"
//       ) {
//         return classificationOverview.classified;
//       }

//       const classifications = asRecord(
//         data.classifications,
//       );

//       if (
//         typeof classifications.count === "number"
//       ) {
//         return classifications.count;
//       }

//       return 0;
//     },

//     staleTime: 30_000,

//     refetchOnWindowFocus: false,
//   });
// }


import { useQuery } from "@tanstack/react-query";

import {
getAnalytics,
type AnalyticsQuery,
} from "../api/analytics.api";

type UnknownRecord = Record<string, unknown>;

export interface InboxItem {
id: string;
content: string;
customerName: string;
customerEmail?: string;
status: string;
sentiment: string;
rating?: number;
category?: string;
source: string;
channel?: string;
createdAt: string;
updatedAt?: string;
[key: string]: unknown;
}

export interface InboxListResponse {
items: InboxItem[];
total: number;
page: number;
limit: number;
}

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

* Safely unwrap API responses.
*
* Supports:
*
* {
* data: {...}
* }
*
* and:
*
* {
* ...
* }
  */
  function getPayload(response: unknown): UnknownRecord {
  const root = asRecord(response);

if (
root.data !== undefined &&
root.data !== null &&
typeof root.data === "object"
) {
return asRecord(root.data);
}

return root;
}

/**

* Find an array in several possible API response formats.
  */
  function getArray(
  data: UnknownRecord,
  keys: string[],
  ): unknown[] {
  for (const key of keys) {
  if (Array.isArray(data[key])) {
  return data[key] as unknown[];
  }
  }

return [];
}

/**

* Normalize feedback/inbox records.
  */
  function normalizeInboxItem(
  value: unknown,
  index: number,
  ): InboxItem {
  const item = asRecord(value);

const customer = asRecord(item.customer);
const user = asRecord(item.user);

const id =
item.id ??
item.feedbackId ??
item._id ??
`inbox-${index}`;

const content =
item.content ??
item.message ??
item.text ??
item.feedback ??
item.comment ??
"";

const customerName =
item.customerName ??
customer.name ??
user.name ??
item.name ??
"Unknown Customer";

const customerEmail =
item.customerEmail ??
customer.email ??
user.email;

const status =
item.status ??
item.feedbackStatus ??
"NEW";

const sentiment =
item.sentiment ??
item.sentimentLabel ??
"Neutral";

const rating =
item.rating ??
item.score;

const category =
item.category ??
item.classification;

const source =
item.source ??
item.sourceName ??
item.channel ??
"Unknown";

const channel =
item.channel ??
item.feedbackChannel;

const createdAt =
item.createdAt ??
item.created_at ??
item.date ??
new Date().toISOString();

const updatedAt =
item.updatedAt ??
item.updated_at;

return {
...item,

id: String(id),

content: String(content),

customerName: String(customerName),

customerEmail:
  customerEmail !== undefined
    ? String(customerEmail)
    : undefined,

status: String(status),

sentiment: String(sentiment),

rating:
  rating !== undefined
    ? toNumber(rating)
    : undefined,

category:
  category !== undefined
    ? String(category)
    : undefined,

source: String(source),

channel:
  channel !== undefined
    ? String(channel)
    : undefined,

createdAt: String(createdAt),

updatedAt:
  updatedAt !== undefined
    ? String(updatedAt)
    : undefined,

};
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

* Get inbox / feedback list.
*
* IMPORTANT:
* This hook is exported from this file because the
* Admin Dashboard and Admin Inbox pages import it here.
  */
  export function useInboxList(
  query: AnalyticsQuery = {},
  ) {
  return useQuery<InboxListResponse>({
  queryKey: [
  "analytics",
  "inbox-list",
  query,
  ],

  queryFn: async (): Promise<InboxListResponse> => {
  const response = await getAnalytics(query);

  const data = getPayload(response);

  /**
  * Supported API formats:
  *
  * {
  *   items: [...]
  * }
  *
  * {
  *   feedback: [...]
  * }
  *
  * {
  *   feedbacks: [...]
  * }
  *
  * {
  *   inbox: [...]
  * }
  *
  * {
  *   results: [...]
  * }
  */
  const rawItems = getArray(data, [
  "items",
  "feedback",
  "feedbacks",
  "inbox",
  "results",
  "rows",
  ]);

  const items = rawItems.map(
  normalizeInboxItem,
  );

  const totalValue =
  data.total ??
  data.totalCount ??
  data.count ??
  data.pagination
  ? asRecord(data.pagination).total
  : undefined;

  const pageValue =
  data.page ??
  asRecord(data.pagination).page ??
  query.page ??
  1;

  const limitValue =
  data.limit ??
  asRecord(data.pagination).limit ??
  query.limit ??
  items.length;

  return {
  items,

  
   total:
     totalValue !== undefined
       ? toNumber(totalValue)
       : items.length,

   page: toNumber(pageValue) || 1,

   limit:
     toNumber(limitValue) ||
     items.length,
  

  };
  },

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

  if (
  typeof overview.totalFeedback === "number"
  ) {
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

  if (typeof data.classified === "number") {
  return data.classified;
  }

  if (
  typeof data.classifiedCount === "number"
  ) {
  return data.classifiedCount;
  }

  if (
  typeof data.classificationsCount === "number"
  ) {
  return data.classificationsCount;
  }

  const classificationOverview =
  asRecord(
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

  const classifications =
  asRecord(data.classifications);

  if (
  typeof classifications.count ===
  "number"
  ) {
  return classifications.count;
  }

  return 0;
  },

  staleTime: 30_000,

  refetchOnWindowFocus: false,
  });
  }
