import type { DailySummary, IntradayQuote } from "../types/stock.js";

export function round4(value: number): number {
  return Math.round((value + Number.EPSILON) * 1e4) / 1e4;
}

interface DayBucket {
  lowSum: number;
  highSum: number;
  volumeSum: number;
  count: number;
}

function exchangeDay(epochSeconds: number, formatter: Intl.DateTimeFormat): string {
  const parts = formatter.formatToParts(new Date(epochSeconds * 1000));
  let year = "";
  let month = "";
  let day = "";

  for (const part of parts) {
    if (part.type === "year") year = part.value;
    else if (part.type === "month") month = part.value;
    else if (part.type === "day") day = part.value;
  }

  return `${year}-${month}-${day}`;
}

export function aggregateDaily(
  timestamps: number[],
  quote: IntradayQuote,
  timeZone: string,
): DailySummary[] {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const buckets = new Map<string, DayBucket>();

  for (let i = 0; i < timestamps.length; i++) {
    const low = quote.low[i];
    const high = quote.high[i];
    const volume = quote.volume[i];
    if (low == null || high == null || volume == null) {
      continue;
    }

    const day = exchangeDay(timestamps[i], formatter);
    const bucket = buckets.get(day) ?? { lowSum: 0, highSum: 0, volumeSum: 0, count: 0 };
    bucket.lowSum += low;
    bucket.highSum += high;
    bucket.volumeSum += volume;
    bucket.count += 1;
    buckets.set(day, bucket);
  }

  return [...buckets.entries()]
    .map(([day, bucket]) => ({
      day,
      lowAverage: round4(bucket.lowSum / bucket.count),
      highAverage: round4(bucket.highSum / bucket.count),
      volume: Math.round(bucket.volumeSum),
    }))
    .sort((a, b) => a.day.localeCompare(b.day));
}
