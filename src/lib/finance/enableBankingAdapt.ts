import type { EnableBankingTransaction } from "@/lib/finance/enableBankingClient";
import type { ParsedImportRow } from "@/lib/finance/csvParsing";

export type AdaptedRow = ParsedImportRow & { externalId: string };

/**
 * Maps an Enable Banking transaction (Berlin Group-ish shape: transaction_amount,
 * credit_debit_indicator, booking_date, remittance_information_unstructured,
 * entry_reference) into our ParsedImportRow shape. Field names should be confirmed
 * against a real sandbox response — this follows the commonly documented shape for
 * this class of open-banking API but hasn't been exercised against a live call yet.
 */
export function adaptEnableBankingTransaction(raw: EnableBankingTransaction): AdaptedRow | null {
  const amountInfo = raw.transaction_amount as { amount?: string; currency?: string } | undefined;
  const rawAmount = amountInfo?.amount;
  const bookingDate = (raw.booking_date as string) ?? (raw.value_date as string);
  const indicator = raw.credit_debit_indicator as string | undefined;
  const externalId = (raw.entry_reference as string) ?? (raw.transaction_id as string);

  if (!rawAmount || !bookingDate || !externalId) return null;

  const magnitude = Math.abs(Number(rawAmount));
  if (!Number.isFinite(magnitude)) return null;

  const signed = indicator === "DBIT" ? -magnitude : magnitude;

  const description =
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
