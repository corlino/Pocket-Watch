/**
 * Precision-safe money handling (PRD FR-TRANS-003, §8.2; TAD §6.2).
 *
 * Amounts travel as strings ("1234.56") between Postgres NUMERIC and the app,
 * and all arithmetic goes through decimal.js — never JavaScript floats.
 * Formatting is a display concern only and never changes stored values.
 */
import Decimal from "decimal.js";

export type MoneyString = string & { readonly __brand: "MoneyString" };

export const MAX_AMOUNT = new Decimal("9999999999.99"); // NUMERIC(12,2)

const AMOUNT_INPUT = /^\d+(\.\d{0,2})?$|^\.\d{1,2}$/;

export type AmountParseResult =
  | { ok: true; value: MoneyString }
  | { ok: false; error: string };

/**
 * Validate user input for an amount. Accepts "12", "12.5", "12.50", ".5" and
 * ignores thousands separators and a leading currency symbol.
 */
export function parseAmountInput(
  raw: string,
  { allowZero = false }: { allowZero?: boolean } = {},
): AmountParseResult {
  const cleaned = raw.trim().replace(/^\$/, "").replace(/,/g, "");
  if (cleaned === "") return { ok: false, error: "Enter an amount." };
  if (!AMOUNT_INPUT.test(cleaned)) {
    return { ok: false, error: "Use numbers only, with up to two decimal places." };
  }
  const value = new Decimal(cleaned);
  if (allowZero ? value.isNegative() : value.lte(0)) {
    return { ok: false, error: allowZero ? "Amount can't be negative." : "Amount must be greater than zero." };
  }
  if (value.gt(MAX_AMOUNT)) return { ok: false, error: "That amount is too large." };
  return { ok: true, value: value.toFixed(2) as MoneyString };
}

export function toDecimal(value: string | number | Decimal): Decimal {
  return new Decimal(value);
}

export function sumMoney(values: Iterable<string | Decimal>): Decimal {
  let total = new Decimal(0);
  for (const v of values) total = total.plus(v);
  return total;
}

// ---------------------------------------------------------------------------
// Display formatting
// ---------------------------------------------------------------------------

export const CURRENCIES = ["CAD", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const NUMBER_FORMATS = ["comma-dot", "space-comma", "dot-comma"] as const;
export type NumberFormat = (typeof NUMBER_FORMATS)[number];

export const NUMBER_FORMAT_LABELS: Record<NumberFormat, string> = {
  "comma-dot": "1,234.56",
  "space-comma": "1 234,56",
  "dot-comma": "1.234,56",
};

const SYMBOLS: Record<Currency, string> = { CAD: "$", USD: "$", EUR: "€", GBP: "£" };

export function currencySymbol(currency: Currency): string {
  return SYMBOLS[currency];
}

export type MoneyFormatOptions = {
  currency?: Currency;
  numberFormat?: NumberFormat;
  /** "always" adds + for positives (income rows). */
  sign?: "auto" | "always" | "never";
};

function groupDigits(int: string, separator: string): string {
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Format a money value, e.g. "$1,234.56", "-$348.52", "+$2,624.84".
 * Rounds half-up to 2 places for display only.
 */
export function formatMoney(
  value: string | Decimal,
  { currency = "CAD", numberFormat = "comma-dot", sign = "auto" }: MoneyFormatOptions = {},
): string {
  const d = new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const [int, frac] = d.abs().toFixed(2).split(".");
  const [group, decimal] =
    numberFormat === "space-comma" ? [" ", ","] : numberFormat === "dot-comma" ? [".", ","] : [",", "."];
  const body = `${SYMBOLS[currency]}${groupDigits(int, group)}${decimal}${frac}`;
  if (d.isZero() || sign === "never") return body;
  if (d.isNegative()) return `-${body}`;
  return sign === "always" ? `+${body}` : body;
}

/** Signed display for a transaction row: income "+$x", expense "-$x". */
export function formatTransactionAmount(
  amount: string,
  type: "income" | "expense",
  options: Omit<MoneyFormatOptions, "sign"> = {},
): string {
  const signed = type === "expense" ? new Decimal(amount).negated() : new Decimal(amount);
  return formatMoney(signed, { ...options, sign: "always" });
}

/** Percentage with up to 2 decimals; null renders as "—" (unavailable). */
export function formatPercent(value: Decimal | null, numberFormat: NumberFormat = "comma-dot"): string {
  if (value == null) return "—";
  const s = value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
  return `${numberFormat === "comma-dot" ? s : s.replace(".", ",")}%`;
}
