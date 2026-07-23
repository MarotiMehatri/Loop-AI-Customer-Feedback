import { Router } from "express";
import { insightController } from "../../../../controllers/insight.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";
import { analystRole } from "../../../../middleware/analyst-role.middleware.js";

const router = Router();

router.get("/", authenticate, analystRole, insightController.getFrequentDelays);

export default router;
