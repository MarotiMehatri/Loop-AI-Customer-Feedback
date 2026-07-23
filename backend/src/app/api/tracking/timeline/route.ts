import { Router } from "express";
import { trackingController } from "../../../../controllers/tracking.controller.js";
import { authenticate } from "../../../../middleware/auth.middleware.js";
import { analystRole } from "../../../../middleware/analyst-role.middleware.js";

const router = Router();

router.get("/", authenticate, analystRole, trackingController.timeline);

export default router;
