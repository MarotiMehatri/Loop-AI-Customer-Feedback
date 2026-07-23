import { Router } from "express";
import { feedbackController } from "../../../../../controllers/feedback.controller.js";
import { authenticate } from "../../../../../middleware/auth.middleware.js";
import { analystRole } from "../../../../../middleware/analyst-role.middleware.js";

const router = Router();

router.patch("/", authenticate, analystRole, feedbackController.changeStatus);

export default router;
