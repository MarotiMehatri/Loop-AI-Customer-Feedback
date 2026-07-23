import { Router } from "express";
import { reportController } from "../../../../controllers/report.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";
import { analystRole } from "../../../../middleware/analyst-role.middleware.js";

const router = Router();

router.get("/", authenticate, analystRole, reportController.getCustomerReport);

export default router;
