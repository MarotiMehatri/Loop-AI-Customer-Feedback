import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";
import { analyticsController } from "./analytics.controller.js";

const analyticsRouter = Router();
analyticsRouter.use(authenticate);
analyticsRouter.use(authorize("ADMIN", "ANALYST", "VIEWER"));
analyticsRouter.get("/", analyticsController.dashboard);
analyticsRouter.get("/overview", analyticsController.overview);
analyticsRouter.get("/trend", analyticsController.trend);
analyticsRouter.get("/sentiment", analyticsController.sentiment);
analyticsRouter.get("/sources", analyticsController.sources);
analyticsRouter.get("/categories", analyticsController.categories);
analyticsRouter.get("/themes", analyticsController.themes);
analyticsRouter.get("/hourly", analyticsController.hourly);
analyticsRouter.get("/export", analyticsController.export);
export { analyticsRouter };
