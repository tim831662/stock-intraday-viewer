import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("keeps search disabled until the input has a symbol", async () => {
    const user = userEvent.setup();
    render(<SearchBar loading={false} onSearch={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Search" });

    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Symbol"), "   ");
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText("Symbol"), "A");
    expect(button).toBeEnabled();
  });

  it("trims the symbol and submits it on click", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar loading={false} onSearch={onSearch} />);
    const input = screen.getByLabelText("Symbol");

    await user.type(input, " aapl ");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(onSearch).toHaveBeenCalledWith("aapl");
    expect(input).toHaveValue("aapl");
  });

  it("submits when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar loading={false} onSearch={onSearch} />);

    await user.type(screen.getByLabelText("Symbol"), "MSFT{Enter}");

    expect(onSearch).toHaveBeenCalledWith("MSFT");
  });

  it("does not submit while loading", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar loading={false} onSearch={onSearch} />);

    await user.type(screen.getByLabelText("Symbol"), "AAPL");
    rerender(<SearchBar loading onSearch={onSearch} />);

    expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(onSearch).not.toHaveBeenCalled();
  });
});
