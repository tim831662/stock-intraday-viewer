export interface DailySummary {
  day: string;
  lowAverage: number;
  highAverage: number;
  volume: number;
}

export interface IntradayQuote {
  low: Array<number | null>;
  high: Array<number | null>;
  volume: Array<number | null>;
}
