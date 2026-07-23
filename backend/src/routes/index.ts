import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";
import { feedbackRouter } from "../modules/feedback/feedback.routes.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LOOP API is running",
    version: "1.0.0",
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/feedback", feedbackRouter);

apiRouter.use("/feedback-import", feedbackRouter);
