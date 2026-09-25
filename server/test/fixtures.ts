import type { IntradayQuote } from "../src/types/stock.js";

export const NEW_YORK = "America/New_York";
export const TOKYO = "Asia/Tokyo";

export interface Candle {
  at: string;
  low: number | null;
  high: number | null;
  volume: number | null;
}

export function series(candles: Candle[]): { timestamps: number[]; quote: IntradayQuote } {
  return {
    timestamps: candles.map((candle) => Date.parse(candle.at) / 1000),
    quote: {
      low: candles.map((candle) => candle.low),
      high: candles.map((candle) => candle.high),
      volume: candles.map((candle) => candle.volume),
    },
  };
}
