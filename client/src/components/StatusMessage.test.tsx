import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusMessage } from "./StatusMessage";

describe("StatusMessage", () => {
  it("shows a loading message", () => {
    render(<StatusMessage status="loading" error={null} isEmpty={false} />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("shows the error message", () => {
    render(<StatusMessage status="error" error="Invalid symbol" isEmpty={false} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid symbol");
  });

  it("shows a no-data message when the search succeeds with no rows", () => {
    render(<StatusMessage status="success" error={null} isEmpty />);
    expect(screen.getByRole("status")).toHaveTextContent("No data");
  });

  it("renders nothing while idle or when rows are present", () => {
    const { container, rerender } = render(
      <StatusMessage status="idle" error={null} isEmpty={false} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<StatusMessage status="success" error={null} isEmpty={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
