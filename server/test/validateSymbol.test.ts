import { describe, expect, it } from "vitest";
import { AppError } from "../src/errors/AppError.js";
import { validateSymbol } from "../src/validation/symbol.js";

describe("validateSymbol", () => {
  it.each(["AAPL", "BRK-B", "^GSPC", "EURUSD=X", "BTC-USD", "BRK.A"])(
    "accepts %s",
    (symbol) => {
      expect(validateSymbol(symbol)).toBe(symbol);
    },
  );

  it("trims and uppercases before matching", () => {
    expect(validateSymbol(" aapl ")).toBe("AAPL");
    expect(validateSymbol("brk-b")).toBe("BRK-B");
  });

  it.each(["", "   ", "!!!", "AAPL!", "AA PL", "ABCDEFGHIJKLMNOP"])(
    "rejects %j",
    (symbol) => {
      expect(() => validateSymbol(symbol)).toThrow(AppError);
      try {
        validateSymbol(symbol);
      } catch (error) {
        expect(error).toMatchObject({ statusCode: 400, code: "INVALID_SYMBOL" });
      }
    },
  );
});
