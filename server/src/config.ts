export const config = {
  port: Number(process.env.PORT) || 3001,
  yahooBaseUrl: process.env.YAHOO_BASE_URL ?? "https://query1.finance.yahoo.com",
  yahooTimeoutMs: Number(process.env.YAHOO_TIMEOUT_MS) || 8000,
};
