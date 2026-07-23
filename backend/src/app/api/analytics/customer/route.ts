import { Router } from "express";
import { analyticsController } from "../../../../controllers/analytics.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";
import { analystRole } from "../../../../middleware/analyst-role.middleware.js";

const router = Router();

router.get("/", authenticate, analystRole, analyticsController.getCustomerAnalytics);

export default router;
