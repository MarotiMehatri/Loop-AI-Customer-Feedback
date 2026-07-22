import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";

export const apiRouter = Router();

apiRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "LOOP API is running",
  });
});

apiRouter.use("/auth", authRouter);
