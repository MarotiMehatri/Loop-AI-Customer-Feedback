import { Router } from "express";

import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import authLogin from "../app/api/auth/login/route.js";
import authLogout from "../app/api/auth/logout/route.js";
import authRefresh from "../app/api/auth/refresh-token/route.js";
import authProfile from "../app/api/auth/profile/route.js";

import dashboardOverview from "../app/api/dashboard/overview/route.js";
import dashboardShipmentSummary from "../app/api/dashboard/shipment-summary/route.js";
import dashboardDeliveryPerformance from "../app/api/dashboard/delivery-performance/route.js";
import dashboardCourierPerformance from "../app/api/dashboard/courier-performance/route.js";
import dashboardFailedDeliveries from "../app/api/dashboard/failed-deliveries/route.js";
import dashboardDelayedShipments from "../app/api/dashboard/delayed-shipments/route.js";
import dashboardMonthlyReport from "../app/api/dashboard/monthly-report/route.js";
import dashboardKpi from "../app/api/dashboard/kpi/route.js";

import analyticsShipment from "../app/api/analytics/shipment/route.js";
import analyticsCourier from "../app/api/analytics/courier/route.js";
import analyticsCustomer from "../app/api/analytics/customer/route.js";
import analyticsDelivery from "../app/api/analytics/delivery/route.js";
import analyticsRevenue from "../app/api/analytics/revenue/route.js";
import analyticsTrend from "../app/api/analytics/trend/route.js";
import analyticsHeatmap from "../app/api/analytics/heatmap/route.js";
import analyticsComparison from "../app/api/analytics/comparison/route.js";
import analyticsFilters from "../app/api/analytics/filters/route.js";

import reportsShipment from "../app/api/reports/shipment/route.js";
import reportsCourier from "../app/api/reports/courier/route.js";
import reportsCustomer from "../app/api/reports/customer/route.js";
import reportsDelivery from "../app/api/reports/delivery/route.js";
import reportsEmployee from "../app/api/reports/employee/route.js";
import reportsExportPdf from "../app/api/reports/export-pdf/route.js";
import reportsExportExcel from "../app/api/reports/export-excel/route.js";
import reportsHistory from "../app/api/reports/history/route.js";

import trackingSearch from "../app/api/tracking/search/route.js";
import trackingTimeline from "../app/api/tracking/timeline/route.js";
import trackingStatus from "../app/api/tracking/status/route.js";
import trackingParcelHistory from "../app/api/tracking/parcel-history/route.js";

import notificationsHistory from "../app/api/notifications/history/route.js";
import notificationsDeliveryAlerts from "../app/api/notifications/delivery-alerts/route.js";
import notificationsFailedNotifications from "../app/api/notifications/failed-notifications/route.js";

import insightsTopCouriers from "../app/api/insights/top-couriers/route.js";
import insightsWorstPerforming from "../app/api/insights/worst-performing/route.js";
import insightsFrequentDelays from "../app/api/insights/frequent-delays/route.js";
import insightsRegionAnalysis from "../app/api/insights/region-analysis/route.js";
import insightsCustomerAnalysis from "../app/api/insights/customer-analysis/route.js";
import insightsRecommendations from "../app/api/insights/recommendations/route.js";

import feedbackRoutes from "../app/api/feedback/route.js";
import feedbackIdRoutes from "../app/api/feedback/[id]/route.js";
import feedbackStatusRoutes from "../app/api/feedback/[id]/status/route.js";
import feedbackImportRoutes from "../app/api/feedback/import/route.js";
import feedbackStatsRoutes from "../app/api/feedback/stats/route.js";
import feedbackSearchRoutes from "../app/api/feedback/search/route.js";

import themeRoutes from "../app/api/themes/route.js";
import themeIdRoutes from "../app/api/themes/[id]/route.js";
import themeStatsRoutes from "../app/api/themes/stats/route.js";

import askLoopRoutes from "../app/api/ask-loop/route.js";

const router = Router();

router.get(
  "/database-check",
  asyncHandler(async (_req, res) => {
    const workspaceCount = await prisma.workspace.count();
    const userCount = await prisma.user.count();

    res.status(200).json({
      success: true,
      message: "PostgreSQL and Prisma are connected successfully",
      data: {
        workspaces: workspaceCount,
        users: userCount,
      },
    });
  }),
);

router.use("/auth/login", authLogin);
router.use("/auth/logout", authLogout);
router.use("/auth/refresh-token", authRefresh);
router.use("/auth/profile", authProfile);

router.use("/dashboard/overview", dashboardOverview);
router.use("/dashboard/shipment-summary", dashboardShipmentSummary);
router.use("/dashboard/delivery-performance", dashboardDeliveryPerformance);
router.use("/dashboard/courier-performance", dashboardCourierPerformance);
router.use("/dashboard/failed-deliveries", dashboardFailedDeliveries);
router.use("/dashboard/delayed-shipments", dashboardDelayedShipments);
router.use("/dashboard/monthly-report", dashboardMonthlyReport);
router.use("/dashboard/kpi", dashboardKpi);

router.use("/analytics/shipment", analyticsShipment);
router.use("/analytics/courier", analyticsCourier);
router.use("/analytics/customer", analyticsCustomer);
router.use("/analytics/delivery", analyticsDelivery);
router.use("/analytics/revenue", analyticsRevenue);
router.use("/analytics/trend", analyticsTrend);
router.use("/analytics/heatmap", analyticsHeatmap);
router.use("/analytics/comparison", analyticsComparison);
router.use("/analytics/filters", analyticsFilters);

router.use("/reports/shipment", reportsShipment);
router.use("/reports/courier", reportsCourier);
router.use("/reports/customer", reportsCustomer);
router.use("/reports/delivery", reportsDelivery);
router.use("/reports/employee", reportsEmployee);
router.use("/reports/export-pdf", reportsExportPdf);
router.use("/reports/export-excel", reportsExportExcel);
router.use("/reports/history", reportsHistory);

router.use("/tracking/search", trackingSearch);
router.use("/tracking/timeline", trackingTimeline);
router.use("/tracking/status", trackingStatus);
router.use("/tracking/parcel-history", trackingParcelHistory);

router.use("/notifications/history", notificationsHistory);
router.use("/notifications/delivery-alerts", notificationsDeliveryAlerts);
router.use("/notifications/failed-notifications", notificationsFailedNotifications);

router.use("/insights/top-couriers", insightsTopCouriers);
router.use("/insights/worst-performing", insightsWorstPerforming);
router.use("/insights/frequent-delays", insightsFrequentDelays);
router.use("/insights/region-analysis", insightsRegionAnalysis);
router.use("/insights/customer-analysis", insightsCustomerAnalysis);
router.use("/insights/recommendations", insightsRecommendations);

router.use("/feedback", feedbackRoutes);
router.use("/feedback/:id", feedbackIdRoutes);
router.use("/feedback/:id/status", feedbackStatusRoutes);
router.use("/feedback/import", feedbackImportRoutes);
router.use("/feedback/stats", feedbackStatsRoutes);
router.use("/feedback/search", feedbackSearchRoutes);

router.use("/themes", themeRoutes);
router.use("/themes/:id", themeIdRoutes);
router.use("/themes/stats", themeStatsRoutes);

router.use("/ask-loop", askLoopRoutes);

export default router;
