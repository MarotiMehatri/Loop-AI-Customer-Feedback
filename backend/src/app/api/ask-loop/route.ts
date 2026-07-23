import { Router } from "express";
import { askLoopController } from "../../../controllers/ask-loop.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { analystRole } from "../../../middleware/analyst-role.middleware.js";

const router = Router();

router.post("/", authenticate, analystRole, askLoopController.ask);

export default router;
