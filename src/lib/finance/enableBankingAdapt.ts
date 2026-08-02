import type { EnableBankingTransaction } from "@/lib/finance/enableBankingClient";
import type { ParsedImportRow } from "@/lib/finance/csvParsing";

export type AdaptedRow = ParsedImportRow & { externalId: string };

/**
 * Maps an Enable Banking transaction (snake_case shape: transaction_amount,
 * credit_debit_indicator, booking_date, remittance_information, entry_reference — matching
 * the snake_case convention the rest of enableBankingClient.ts's calls already use and get
 * a 2xx response for: session_id, valid_until, redirect_url, date_from) into our
 * ParsedImportRow shape. Field names still aren't confirmed against a real sandbox response,
 * so rows with an unexpected shape are dropped with a console.warn (not silently kept with a
 * guessed value) — critically for credit_debit_indicator, where guessing wrong would silently
 * flip every debit into income instead of just failing loudly.
 */
export function adaptEnableBankingTransaction(raw: EnableBankingTransaction): AdaptedRow | null {
  const amountInfo = raw.transaction_amount as { amount?: string; currency?: string } | undefined;
  const rawAmount = amountInfo?.amount;
  const bookingDate =
    (raw.booking_date as string) ?? (raw.value_date as string) ?? (raw.transaction_date as string);
  const indicator = raw.credit_debit_indicator as string | undefined;
  const externalId = (raw.entry_reference as string) ?? (raw.transaction_id as string);

  if (!rawAmount || !bookingDate || !externalId) {
    console.warn(
      `[enableBankingAdapt] transaction dropped — missing amount/date/id, keys were: ${Object.keys(raw).join(", ")}`
    );
    return null;
  }

  const magnitude = Math.abs(Number(rawAmount));
  if (!Number.isFinite(magnitude)) return null;

  if (indicator !== "DBIT" && indicator !== "CRDT") {
    console.warn(`[enableBankingAdapt] transaction dropped — unrecognized credit_debit_indicator: "${indicator}"`);
    return null;
  }
  const signed = indicator === "DBIT" ? -magnitude : magnitude;

  const description =
    (Array.isArray(raw.remittance_information) ? (raw.remittance_information as string[]).join(" ") : undefined) ||
    (raw.remittance_information_unstructured as string) ||
    (Array.isArray(raw.remittance_information_unstructured_array)
      ? (raw.remittance_information_unstructured_array as string[]).join(" ")
      : undefined) ||
    (raw.additional_information as string) ||
    "Transaction bancaire";

  return {
    date: new Date(bookingDate).toISOString(),
    description,
    amount: signed,
    isDuplicate: false,
    externalId,
  };
}

export function adaptEnableBankingTransactions(rows: EnableBankingTransaction[]): AdaptedRow[] {
  return rows.map(adaptEnableBankingTransaction).filter((r): r is AdaptedRow => r !== null);
}
