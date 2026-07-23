import { z } from "zod";

const exportFiltersSchema = z
  .object({
    status: z.string().optional(),
    region: z.string().optional(),
    courierId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .optional()
  .default({});

export const exportPdfSchema = z.object({
  type: z.enum([
    "shipment",
    "courier",
    "customer",
    "delivery",
    "employee",
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  filters: exportFiltersSchema,
});

export const exportExcelSchema = z.object({
  type: z.enum([
    "shipment",
    "courier",
    "customer",
    "delivery",
    "employee",
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  filters: exportFiltersSchema,
});

export type ExportPdfInput = z.infer<typeof exportPdfSchema>;
export type ExportExcelInput = z.infer<typeof exportExcelSchema>;
