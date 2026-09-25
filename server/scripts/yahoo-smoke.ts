import { fetchYahooChart } from "../src/clients/yahoo.client.js";
import { AppError } from "../src/errors/AppError.js";
import { validateSymbol } from "../src/validation/symbol.js";

const rawSymbol = process.argv[2];
if (!rawSymbol) {
  console.error("Usage: tsx scripts/yahoo-smoke.ts SYMBOL");
  process.exit(1);
}

try {
  const symbol = validateSymbol(rawSymbol);
  const data = await fetchYahooChart(symbol);
  const preview = data.timestamps.slice(0, 3).map((timestamp, index) => ({
    timestamp,
    low: data.quote.low[index],
    high: data.quote.high[index],
    volume: data.quote.volume[index],
  }));

  console.log(
    JSON.stringify(
      {
        symbol,
        timeZone: data.timeZone,
        candles: data.timestamps.length,
        preview,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (error instanceof AppError) {
    console.error(`${error.code}: ${error.message}`);
    process.exit(1);
  }
  throw error;
}
