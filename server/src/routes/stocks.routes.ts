import { Router } from "express";
import { getDailySummaries } from "../services/stocks.service.js";
import { validateSymbol } from "../validation/symbol.js";

export function createStocksRouter(): Router {
  const router = Router();

  router.get("/:symbol/daily", async (req, res, next) => {
    try {
      const symbol = validateSymbol(req.params.symbol);
      const daily = await getDailySummaries(symbol);
      res.json(daily);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
