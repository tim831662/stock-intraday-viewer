import { aggregateDaily } from "../domain/aggregateDaily.js";
import { fetchYahooChart } from "../clients/yahoo.client.js";
import type { DailySummary } from "../types/stock.js";

export async function getDailySummaries(symbol: string): Promise<DailySummary[]> {
  const chart = await fetchYahooChart(symbol);
  return aggregateDaily(chart.timestamps, chart.quote, chart.timeZone);
}
