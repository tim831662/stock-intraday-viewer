export interface DailySummary {
  day: string;
  lowAverage: number;
  highAverage: number;
  volume: number;
}

export class StockApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockApiError";
  }
}

export async function fetchDailyStock(symbol: string): Promise<DailySummary[]> {
  const response = await fetch(`/api/stocks/${encodeURIComponent(symbol)}/daily`);

  if (!response.ok) {
    throw new StockApiError(await readErrorMessage(response));
  }

  const body: unknown = await response.json();
  if (!Array.isArray(body)) {
    throw new StockApiError("Request failed");
  }

  return body as DailySummary[];
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (isErrorBody(body)) {
      return body.error.message;
    }
  } catch {
    // The response was not JSON.
  }

  return "Request failed";
}

function isErrorBody(body: unknown): body is { error: { message: string } } {
  if (typeof body !== "object" || body === null || !("error" in body)) {
    return false;
  }

  const error = body.error;
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  );
}
