import { z } from "zod";

export const generateReportSchema = z.object({
  type: z.enum([
    "shipment",
    "courier",
    "customer",
    "delivery",
    "employee",
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  filters: z
    .object({
      status: z.string().optional(),
      region: z.string().optional(),
      courierId: z.string().uuid().optional(),
      rating: z.number().int().min(1).max(5).optional(),
    })
    .optional()
    .default({}),
});

export const exportSchema = z.object({
  reportId: z.string().uuid(),
  format: z.enum(["pdf", "excel"]),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
