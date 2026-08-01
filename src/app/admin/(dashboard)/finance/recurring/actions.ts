"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRecurringItem, deleteRecurringItem, updateRecurringItem } from "@/services/finance/recurringItems";
import { prisma } from "@/lib/prisma";
import { createTransaction } from "@/services/finance/transactions";

export async function createRecurringItemAction(formData: FormData) {
  const dayOfMonthRaw = formData.get("dayOfMonth");
  const intervalDaysRaw = formData.get("intervalDays");
  const endDateRaw = formData.get("endDate");

  await createRecurringItem({
    accountId: String(formData.get("accountId")),
    categoryId: String(formData.get("categoryId") || "") || null,
    label: String(formData.get("label")),
    scope: String(formData.get("scope")) as "PRO" | "PERSO",
    direction: String(formData.get("direction")) as "income" | "expense",
    amount: Number(formData.get("amount")),
    amountIsEstimate: formData.get("amountIsEstimate") === "on",
    frequency: String(formData.get("frequency")) as
      | "monthly"
      | "quarterly"
      | "annual"
      | "weekly"
      | "custom_days",
    dayOfMonth: dayOfMonthRaw ? Number(dayOfMonthRaw) : null,
    intervalDays: intervalDaysRaw ? Number(intervalDaysRaw) : null,
    startDate: new Date(String(formData.get("startDate"))),
    endDate: endDateRaw ? new Date(String(endDateRaw)) : null,
  });

  revalidatePath("/admin/finance/recurring");
  revalidatePath("/admin/finance/forecast");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/advice");
  redirect("/admin/finance/recurring");
}

export async function updateRecurringItemAction(id: string, formData: FormData) {
  const dayOfMonthRaw = formData.get("dayOfMonth");
  const intervalDaysRaw = formData.get("intervalDays");
  const endDateRaw = formData.get("endDate");

  await updateRecurringItem(id, {
    accountId: String(formData.get("accountId")),
    categoryId: String(formData.get("categoryId") || "") || null,
    label: String(formData.get("label")),
    scope: String(formData.get("scope")) as "PRO" | "PERSO",
    direction: String(formData.get("direction")) as "income" | "expense",
    amount: Number(formData.get("amount")),
    amountIsEstimate: formData.get("amountIsEstimate") === "on",
    frequency: String(formData.get("frequency")) as
      | "monthly"
      | "quarterly"
      | "annual"
      | "weekly"
      | "custom_days",
    dayOfMonth: dayOfMonthRaw ? Number(dayOfMonthRaw) : null,
    intervalDays: intervalDaysRaw ? Number(intervalDaysRaw) : null,
    startDate: new Date(String(formData.get("startDate"))),
    endDate: endDateRaw ? new Date(String(endDateRaw)) : null,
  });

  revalidatePath("/admin/finance/recurring");
  revalidatePath("/admin/finance/forecast");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/advice");
  redirect("/admin/finance/recurring");
}

export async function toggleRecurringItemAction(id: string, isActive: boolean) {
  await updateRecurringItem(id, { isActive });
  revalidatePath("/admin/finance/recurring");
  revalidatePath("/admin/finance/forecast");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/advice");
}

export async function markRecurringItemPaidAction(id: string) {
  const item = await prisma.recurringItem.findUniqueOrThrow({ where: { id } });
  const amount = item.direction === "expense" ? -Number(item.amount) : Number(item.amount);

  await createTransaction({
    accountId: item.accountId,
    categoryId: item.categoryId,
    date: new Date(),
    description: item.label,
    amount,
    scope: item.scope as "PRO" | "PERSO",
    notes: "Ajouté depuis Récurrents (Payé aujourd'hui)",
  });

  revalidatePath("/admin/finance/recurring");
  revalidatePath("/admin/finance/transactions");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/advice");
}

export async function deleteRecurringItemAction(id: string) {
  await deleteRecurringItem(id);
  revalidatePath("/admin/finance/recurring");
  revalidatePath("/admin/finance/forecast");
  revalidatePath("/admin/finance");
  revalidatePath("/admin/finance/advice");
  redirect("/admin/finance/recurring");
}
