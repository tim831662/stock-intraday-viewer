import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DailyTable } from "./DailyTable";

describe("DailyTable", () => {
  it("renders the daily columns and formats volume with thousands separators", () => {
    render(
      <DailyTable
        rows={[
          { day: "2024-06-03", lowAverage: 15, highAverage: 18.5, volume: 1234567 },
          { day: "2024-06-04", lowAverage: 30, highAverage: 40, volume: 7 },
        ]}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Day" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Low Avg" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "High Avg" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Volume" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2024-06-03" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "18.5" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "1,234,567" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "7" })).toBeInTheDocument();
  });
});
