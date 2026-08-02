"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import path from "path";
import {
  createTransaction,
  createTransfer,
  deleteTransaction,
  updateTransaction,
} from "@/services/finance/transactions";
import { getOrCreateCategory } from "@/services/finance/categories";
import { prisma } from "@/lib/prisma";

async function saveReceiptIfPresent(formData: FormData): Promise<string | null> {
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) return null;

  const ext = path.extname(file.name) || ".jpg";
  const blob = await put(`receipts/${randomUUID()}${ext}`, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

export async function createTransactionAction(formData: FormData) {
  const accountId = String(formData.get("accountId"));
  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  const rawAmount = Number(formData.get("amount"));
  const direction = String(formData.get("direction"));
  const categoryId = String(formData.get("categoryId") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  const attachmentPath = await saveReceiptIfPresent(formData);

  await createTransaction({
    accountId,
    categoryId,
    date: new Date(String(formData.get("date"))),
    description: String(formData.get("description")),
    amount: direction === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount),
    scope: account.scope as "PRO" | "PERSO",
    notes,
    attachmentPath,
  });

  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  redirect("/admin/finance/transactions");
}

export async function updateTransactionAction(id: string, formData: FormData) {
  const rawAmount = Number(formData.get("amount"));
  const direction = String(formData.get("direction"));
  const categoryId = String(formData.get("categoryId") || "") || null;
  const notes = String(formData.get("notes") || "") || null;

  await updateTransaction(id, {
    categoryId,
    date: new Date(String(formData.get("date"))),
    description: String(formData.get("description")),
    amount: direction === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount),
    notes,
  });

  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  redirect("/admin/finance/transactions");
}

export async function deleteTransactionAction(id: string) {
  await deleteTransaction(id);
  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  redirect("/admin/finance/transactions");
}

const QUICK_CASH_CATEGORIES = ["Courses", "Carburant", "Péage", "Santé", "Autre"] as const;

/** One-tap cash expense logger for the dashboard widget — skips the full transaction
 * form since cash purchases (courses, essence, péage, santé) need to be jotted down
 * fast, often from a phone, right after paying. Accepts an optional receipt photo
 * (from the "Scanner un ticket" flow or a plain manual upload) stored the same way
 * as the full transaction form's justificatif. */
export async function quickCashExpenseAction(formData: FormData) {
  const accountId = String(formData.get("accountId") || "");
  const account = accountId
    ? await prisma.account.findUniqueOrThrow({ where: { id: accountId } })
    : await prisma.account.findFirstOrThrow({ where: { type: "cash" } });
  if (account.type !== "cash") {
    throw new Error(`Le compte "${account.name}" n'est pas un compte espèces.`);
  }
  const amount = Math.abs(Number(formData.get("amount")));
  const categoryLabel = String(formData.get("category") || "Autre");
  const label = QUICK_CASH_CATEGORIES.includes(categoryLabel as (typeof QUICK_CASH_CATEGORIES)[number])
    ? categoryLabel
    : "Autre";
  const notes = String(formData.get("description") || "") || null;
  const dateRaw = String(formData.get("date") || "");
  const date = dateRaw ? new Date(dateRaw) : new Date();
  const categoryId = await getOrCreateCategory(label, account.scope as "PRO" | "PERSO", "expense");
  const attachmentPath = await saveReceiptIfPresent(formData);

  await createTransaction({
    accountId: account.id,
    categoryId,
    date,
    description: notes ?? label,
    amount: -amount,
    scope: account.scope as "PRO" | "PERSO",
    notes,
    attachmentPath,
  });

  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
}

export async function createTransferAction(formData: FormData) {
  const fromAccountId = String(formData.get("fromAccountId"));
  const toAccountId = String(formData.get("toAccountId"));
  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findUniqueOrThrow({ where: { id: fromAccountId } }),
    prisma.account.findUniqueOrThrow({ where: { id: toAccountId } }),
  ]);

  await createTransfer({
    fromAccountId,
    toAccountId,
    fromScope: fromAccount.scope as "PRO" | "PERSO",
    toScope: toAccount.scope as "PRO" | "PERSO",
    date: new Date(String(formData.get("date"))),
    amount: Number(formData.get("amount")),
    description: String(formData.get("description") || "Virement interne"),
  });

  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  redirect("/admin/finance/transactions");
}
