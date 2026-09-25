import { AppError } from "../errors/AppError.js";

const SYMBOL_PATTERN = /^[A-Z0-9.\-^=]{1,15}$/;

export function validateSymbol(input: string): string {
  const symbol = input.trim().toUpperCase();
  if (!SYMBOL_PATTERN.test(symbol)) {
    throw new AppError(400, "INVALID_SYMBOL", "Invalid symbol");
  }
  return symbol;
}
