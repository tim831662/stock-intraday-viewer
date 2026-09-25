import { describe, expect, it, vi } from "vitest";
import { fetchYahooChart, YAHOO_USER_AGENT } from "../src/clients/yahoo.client.js";

const BASE_URL = "https://query1.finance.yahoo.com";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function chartBody(overrides: Record<string, unknown> = {}) {
  return {
    chart: {
      result: [
        {
          meta: { exchangeTimezoneName: "America/New_York" },
          timestamp: [1_700_000_000, 1_700_000_900],
          indicators: {
            quote: [
              {
                low: [10, null],
                high: [12, 14],
                volume: [100, 0],
              },
            ],
          },
          ...overrides,
        },
      ],
      error: null,
    },
  };
}

describe("fetchYahooChart", () => {
  it("returns chart fields from a successful response", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(
        `${BASE_URL}/v8/finance/chart/%5EGSPC?interval=15m&range=1mo`,
      );
      expect(new Headers(init?.headers).get("user-agent")).toBe(YAHOO_USER_AGENT);
      return jsonResponse(chartBody());
    });

    await expect(fetchYahooChart("^GSPC", { fetchImpl, baseUrl: BASE_URL })).resolves.toEqual({
      timeZone: "America/New_York",
      timestamps: [1_700_000_000, 1_700_000_900],
      quote: {
        low: [10, null],
        high: [12, 14],
        volume: [100, 0],
      },
    });
  });

  it("maps chart.error No data found to SYMBOL_NOT_FOUND", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(
        {
          chart: {
            result: null,
            error: {
              code: "Not Found",
              description: "No data found, symbol may be delisted",
            },
          },
        },
        404,
      ),
    );

    await expect(fetchYahooChart("ZZZZZZ", { fetchImpl, baseUrl: BASE_URL })).rejects.toMatchObject({
      statusCode: 404,
      code: "SYMBOL_NOT_FOUND",
    });
  });

  it("maps a Yahoo 500 to UPSTREAM_ERROR", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ chart: null }, 500));

    await expect(fetchYahooChart("AAPL", { fetchImpl, baseUrl: BASE_URL })).rejects.toMatchObject({
      statusCode: 502,
      code: "UPSTREAM_ERROR",
    });
  });

  it("maps a Yahoo 429 to UPSTREAM_ERROR", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ finance: { error: "Too Many Requests" } }, 429));

    await expect(fetchYahooChart("AAPL", { fetchImpl, baseUrl: BASE_URL })).rejects.toMatchObject({
      statusCode: 502,
      code: "UPSTREAM_ERROR",
    });
  });

  it("maps an aborted request to UPSTREAM_TIMEOUT", async () => {
    const fetchImpl = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("The operation was aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    });

    await expect(
      fetchYahooChart("AAPL", { fetchImpl, baseUrl: BASE_URL, timeoutMs: 20 }),
    ).rejects.toMatchObject({
      statusCode: 504,
      code: "UPSTREAM_TIMEOUT",
    });
  });

  it("maps a malformed body to UPSTREAM_ERROR", async () => {
    const responses = [
      new Response("not-json", { status: 200 }),
      jsonResponse({ chart: { result: null, error: null } }),
    ];

    for (const response of responses) {
      const fetchImpl = vi.fn(async () => response);
      await expect(fetchYahooChart("AAPL", { fetchImpl, baseUrl: BASE_URL })).rejects.toMatchObject({
        statusCode: 502,
        code: "UPSTREAM_ERROR",
      });
    }
  });
});
