import type { NextFunction, Request, Response, RequestHandler } from "express";
import { analyticsService } from "./analytics.service.js";
import {
  analyticsExportSchema,
  analyticsQuerySchema,
} from "./analytics.validator.js";

function workspaceId(req: Request): string {
  const id = req.user?.workspaceId ?? req.user?.workspaceId;
  if (!id) throw new Error("Workspace context is missing");
  return id;
}

function input(req: Request) {
  return {
    workspaceId: workspaceId(req),
    ...analyticsQuerySchema.parse(req.query),
  };
}

function csv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) {
    return "";
  }

  const firstRow = rows[0]!;

  const headers = Object.keys(firstRow);
  const escape = (value: unknown) =>
    `"${String(Array.isArray(value) ? value.join("|") : (value ?? "")).replaceAll('"', '""')}"`;
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
}

export const analyticsController = {
  async dashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getDashboard(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async overview(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getOverview(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async trend(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getTrend(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async sentiment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getSentimentDistribution(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async sources(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getSourceDistribution(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async categories(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getCategoryDistribution(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async themes(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getTopThemes(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async hourly(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: await analyticsService.getHourlyDistribution(input(req)),
      });
    } catch (e) {
      next(e);
    }
  },
  async export(req: Request, res: Response, next: NextFunction) {
    try {
      const format = analyticsExportSchema.parse({
        ...req.query,
        ...req.body,
      }).format;
      const rows = await analyticsService.exportAnalytics(input(req));
      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="analytics-${Date.now()}.csv"`,
        );
        return res.send(csv(rows as unknown as Array<Record<string, unknown>>));
      }
      return res.json({ success: true, data: rows });
    } catch (e) {
      next(e);
    }
  },
};
