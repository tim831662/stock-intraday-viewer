import express, { type Express } from "express";
import { AppError } from "./errors/AppError.js";
import { errorHandler } from "./errors/errorHandler.js";
import { createApiRouter } from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use("/api", createApiRouter());

  app.use((_req, _res, next) => {
    next(new AppError(404, "NOT_FOUND", "Not found"));
  });

  app.use(errorHandler);

  return app;
}
