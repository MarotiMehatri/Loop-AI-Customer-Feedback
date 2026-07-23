import { Router } from "express";
import { themeController } from "../../../controllers/theme.controller.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { analystRole } from "../../../middleware/analyst-role.middleware.js";

const router = Router();

router.get("/", authenticate, analystRole, themeController.list);
router.post("/", authenticate, analystRole, themeController.create);

export default router;
