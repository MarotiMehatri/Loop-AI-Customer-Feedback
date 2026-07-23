import { z } from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const timelineSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
});

export const statusSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
});

export type SearchInput = z.infer<typeof searchSchema>;
export type TimelineInput = z.infer<typeof timelineSchema>;
export type StatusInput = z.infer<typeof statusSchema>;
