/**
 * Server-side validation for transaction input (PRD FR-TRANS-001…004, 011).
 * Shared by create and edit actions; the client form mirrors these rules for
 * instant feedback but the server is authoritative.
 */
import { z } from "zod";
import { isIsoDate, type IsoDate } from "@/lib/dates/date-only";
import { parseAmountInput, type MoneyString } from "@/lib/money";

export const DESCRIPTION_MAX = 100;
export const NOTES_MAX = 1000;

const isoDate = z
  .string()
  .refine(isIsoDate, "Choose a valid date.")
  .transform((v) => v as IsoDate);

const amount = z.string().transform((raw, ctx) => {
  const parsed = parseAmountInput(raw);
  if (!parsed.ok) {
    ctx.addIssue({ code: "custom", message: parsed.error });
    return z.NEVER;
  }
  return parsed.value as MoneyString;
});

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} can be up to ${max} characters.`)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null));

export const transactionInputSchema = z
  .object({
    type: z.enum(["income", "expense"], { message: "Choose income or expense." }),
    categoryId: z.uuid({ message: "Choose a category." }),
    amount,
    date: isoDate,
    description: optionalText(DESCRIPTION_MAX, "Description"),
    notes: optionalText(NOTES_MAX, "Notes"),
    recurring: z.boolean().default(false),
    interval: z.enum(["weekly", "monthly"]).optional(),
  })
  .refine((v) => !v.recurring || v.interval, { message: "Choose weekly or monthly.", path: ["interval"] });

export type TransactionInput = z.input<typeof transactionInputSchema>;
export type ParsedTransactionInput = z.output<typeof transactionInputSchema>;

export const scheduleUpdateSchema = z.object({
  scheduleId: z.uuid(),
  categoryId: z.uuid({ message: "Choose a category." }),
  amount,
  description: optionalText(DESCRIPTION_MAX, "Description"),
  notes: optionalText(NOTES_MAX, "Notes"),
  interval: z.enum(["weekly", "monthly"]),
  isSubscription: z.boolean().optional(),
});

export type ScheduleUpdateInput = z.input<typeof scheduleUpdateSchema>;

/** Collapse Zod issues into one message per field. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
