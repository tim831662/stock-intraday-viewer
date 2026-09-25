import { config } from "../config.js";
import { AppError } from "../errors/AppError.js";
import type { IntradayQuote } from "../types/stock.js";

export const YAHOO_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export interface YahooChartData {
  timeZone: string;
  timestamps: number[];
  quote: IntradayQuote;
}

export interface FetchYahooChartOptions {
  fetchImpl?: typeof fetch;
  baseUrl?: string;
  timeoutMs?: number;
}

export async function fetchYahooChart(
  symbol: string,
  options: FetchYahooChartOptions = {},
): Promise<YahooChartData> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = (options.baseUrl ?? config.yahooBaseUrl).replace(/\/$/, "");
  const timeoutMs = options.timeoutMs ?? config.yahooTimeoutMs;
  const url = `${baseUrl}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=15m&range=1mo`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": YAHOO_USER_AGENT,
      },
    });
    const body = await readBody(response);
    if (isNoDataFound(body)) {
      throw new AppError(404, "SYMBOL_NOT_FOUND", "No data found");
    }
    if (response.status === 429 || response.status >= 500 || !response.ok) {
      throw new AppError(502, "UPSTREAM_ERROR", "Yahoo request failed");
    }
    return parseChart(body);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (isAbortError(error)) {
      throw new AppError(504, "UPSTREAM_TIMEOUT", "Yahoo request timed out");
    }
    throw new AppError(502, "UPSTREAM_ERROR", "Yahoo request failed");
  } finally {
    clearTimeout(timeout);
  }
}

function malformed(): AppError {
  return new AppError(502, "UPSTREAM_ERROR", "Yahoo returned a malformed response");
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw malformed();
  }
}

function isNoDataFound(body: unknown): boolean {
  const error = asRecord(asRecord(body)?.chart)?.error;
  if (error == null) {
    return false;
  }
  return errorText(error).toLowerCase().includes("no data found");
}

function errorText(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  const record = asRecord(error);
  if (!record) {
    return "";
  }
  return [record.code, record.description, record.message]
    .filter((part): part is string => typeof part === "string")
    .join(" ");
}

function parseChart(body: unknown): YahooChartData {
  const chart = asRecord(asRecord(body)?.chart);
  const result = chart?.result;
  const first = Array.isArray(result) ? asRecord(result[0]) : undefined;
  const timeZone = asRecord(first?.meta)?.exchangeTimezoneName;
  if (!first || typeof timeZone !== "string" || timeZone.length === 0) {
    throw malformed();
  }

  const timestamps = readTimestamps(first.timestamp);
  const quoteList = asRecord(first.indicators)?.quote;
  const quote = Array.isArray(quoteList) ? asRecord(quoteList[0]) : undefined;

  if (!quote && timestamps.length > 0) {
    throw malformed();
  }

  return {
    timeZone,
    timestamps,
    quote: {
      low: readSeries(quote?.low, timestamps.length),
      high: readSeries(quote?.high, timestamps.length),
      volume: readSeries(quote?.volume, timestamps.length),
    },
  };
}

function readTimestamps(value: unknown): number[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw malformed();
  }
  return value.map((item) => {
    if (typeof item !== "number" || !Number.isFinite(item)) {
      throw malformed();
    }
    return item;
  });
}

function readSeries(value: unknown, length: number): Array<number | null> {
  if (length === 0 && value == null) {
    return [];
  }
  if (!Array.isArray(value) || value.length !== length) {
    throw malformed();
  }
  return value.map((item) => {
    if (item == null) {
      return null;
    }
    if (typeof item !== "number" || !Number.isFinite(item)) {
      throw malformed();
    }
    return item;
  });
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
