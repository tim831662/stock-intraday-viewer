import type { DailyStockStatus } from "../hooks/useDailyStock";

interface StatusMessageProps {
  status: DailyStockStatus;
  error: string | null;
  isEmpty: boolean;
}

export function StatusMessage({ status, error, isEmpty }: StatusMessageProps) {
  if (status === "loading") {
    return (
      <p className="status" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="status status-error" role="alert">
        {error ?? "Request failed"}
      </p>
    );
  }

  if (status === "success" && isEmpty) {
    return (
      <p className="status" role="status">
        No data
      </p>
    );
  }

  return null;
}
