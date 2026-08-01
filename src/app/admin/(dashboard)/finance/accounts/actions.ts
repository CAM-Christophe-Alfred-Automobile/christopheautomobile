"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAccount, reconcileBalance } from "@/services/finance/accounts";
import { syncCashPayments } from "@/services/finance/cashPaymentSync";
import { syncFuelExpenses } from "@/services/finance/fuelExpenseSync";

export async function createAccountAction(formData: FormData) {
  await createAccount({
    name: String(formData.get("name")),
    type: String(formData.get("type")),
    scope: String(formData.get("scope")) as "PRO" | "PERSO",
    currentBalance: Number(formData.get("currentBalance") || 0),
  });
  revalidatePath("/admin/finance/accounts");
  revalidatePath("/admin/finance");
  redirect("/admin/finance/accounts");
}

export async function reconcileAccountAction(id: string, formData: FormData) {
  await reconcileBalance(id, Number(formData.get("balance")));
  revalidatePath("/admin/finance/accounts");
  revalidatePath("/admin/finance");
  redirect("/admin/finance/accounts");
}

export async function syncCashAction(accountId: string) {
  await syncCashPayments(accountId);
  await syncFuelExpenses(accountId);
  revalidatePath("/admin/finance/accounts");
  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
}
