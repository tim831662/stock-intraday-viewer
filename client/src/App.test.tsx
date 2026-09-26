import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const sampleDays = [
  { day: "2024-06-03", lowAverage: 15, highAverage: 18, volume: 1500 },
];

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads a symbol and shows the table and chart", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(sampleDays));
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    await user.type(screen.getByLabelText("Symbol"), "AAPL");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("cell", { name: "2024-06-03" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "1,500" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Price averages" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Daily averages" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/stocks/AAPL/daily");
  });

  it("shows the server error message for an invalid symbol", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse({ error: { code: "INVALID_SYMBOL", message: "Invalid symbol" } }, 400),
      ),
    );

    render(<App />);
    await user.type(screen.getByLabelText("Symbol"), "!!!");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid symbol");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows a not-found message", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse({ error: { code: "SYMBOL_NOT_FOUND", message: "No data found" } }, 404),
      ),
    );

    render(<App />);
    await user.type(screen.getByLabelText("Symbol"), "ZZZZZZ");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No data found");
  });

  it("shows a request-failed message when the server is unreachable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockRejectedValue(new TypeError("Failed to fetch")));

    render(<App />);
    await user.type(screen.getByLabelText("Symbol"), "AAPL");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Request failed");
  });

  it("shows a no-data message when the symbol has no candles", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(jsonResponse([])));

    render(<App />);
    await user.type(screen.getByLabelText("Symbol"), "AAPL");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("status")).toHaveTextContent("No data");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
