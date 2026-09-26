import { useCallback, useState } from "react";
import { fetchDailyStock, type DailySummary } from "../api/stocks";

export type DailyStockStatus = "idle" | "loading" | "success" | "error";

export interface DailyStockState {
  status: DailyStockStatus;
  data: DailySummary[] | null;
  error: string | null;
}

export function useDailyStock() {
  const [state, setState] = useState<DailyStockState>({
    status: "idle",
    data: null,
    error: null,
  });

  const search = useCallback(async (symbol: string) => {
    setState({ status: "loading", data: null, error: null });

    try {
      const data = await fetchDailyStock(symbol);
      setState({ status: "success", data, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setState({ status: "error", data: null, error: message });
      throw error;
    }
  }, []);

  return { ...state, search };
}
