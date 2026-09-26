import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { fetchYahooChart } from "../src/clients/yahoo.client.js";
import { AppError } from "../src/errors/AppError.js";

vi.mock("../src/clients/yahoo.client.js", () => ({
  fetchYahooChart: vi.fn(),
}));

const fetchChart = vi.mocked(fetchYahooChart);

describe("GET /api/stocks/:symbol/daily", () => {
  const app = createApp();

  beforeEach(() => {
    fetchChart.mockReset();
  });

  it("aggregates mocked Yahoo candles into daily summaries", async () => {
    fetchChart.mockResolvedValue({
      timeZone: "America/New_York",
      timestamps: [
        Date.parse("2024-06-03T14:00:00Z") / 1000,
        Date.parse("2024-06-03T18:00:00Z") / 1000,
        Date.parse("2024-06-04T14:00:00Z") / 1000,
      ],
      quote: {
        low: [10, 20, 30],
        high: [12, 24, 40],
        volume: [100, 50, 7],
      },
    });

    const response = await request(app).get("/api/stocks/aapl/daily");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { day: "2024-06-03", lowAverage: 15, highAverage: 18, volume: 150 },
      { day: "2024-06-04", lowAverage: 30, highAverage: 40, volume: 7 },
    ]);
    expect(fetchChart).toHaveBeenCalledWith("AAPL");
  });

  it("returns an empty list when Yahoo has no candles", async () => {
    fetchChart.mockResolvedValue({
      timeZone: "America/New_York",
      timestamps: [],
      quote: { low: [], high: [], volume: [] },
    });

    const response = await request(app).get("/api/stocks/AAPL/daily");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("returns 400 for an invalid symbol and does not call Yahoo", async () => {
    const response = await request(app).get("/api/stocks/!!!/daily");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: "INVALID_SYMBOL", message: "Invalid symbol" },
    });
    expect(fetchChart).not.toHaveBeenCalled();
  });

  it("returns 404 when Yahoo has no data for the symbol", async () => {
    fetchChart.mockRejectedValue(new AppError(404, "SYMBOL_NOT_FOUND", "No data found"));

    const response = await request(app).get("/api/stocks/ZZZZZZ/daily");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "SYMBOL_NOT_FOUND", message: "No data found" },
    });
  });

  it("returns 502 when Yahoo fails", async () => {
    fetchChart.mockRejectedValue(new AppError(502, "UPSTREAM_ERROR", "Yahoo request failed"));

    const response = await request(app).get("/api/stocks/AAPL/daily");

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      error: { code: "UPSTREAM_ERROR", message: "Yahoo request failed" },
    });
  });
});
