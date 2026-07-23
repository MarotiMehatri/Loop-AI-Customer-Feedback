import { Router } from "express";
import { dashboardController } from "../../../../controllers/dashboard.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";
import { analystRole } from "../../../../middleware/analyst-role.middleware.js";

const router = Router();

router.get("/", authenticate, analystRole, dashboardController.getMonthlyReport);

export default router;
