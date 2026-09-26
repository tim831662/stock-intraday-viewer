import { Router } from "express";
import { createStocksRouter } from "./stocks.routes.js";

export function createApiRouter(): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  router.use("/stocks", createStocksRouter());

  return router;
}
