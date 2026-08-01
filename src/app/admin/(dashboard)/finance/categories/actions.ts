"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCategory, updateCategory } from "@/services/finance/categories";

export async function createCategoryAction(formData: FormData) {
  const monthlyBudgetRaw = formData.get("monthlyBudget");
  await createCategory({
    name: String(formData.get("name")),
    scope: String(formData.get("scope")) as "PRO" | "PERSO" | "BOTH",
    kind: String(formData.get("kind")) as "income" | "expense",
    monthlyBudget: monthlyBudgetRaw ? Number(monthlyBudgetRaw) : null,
    isEssential: formData.get("isEssential") === "on",
  });
  revalidatePath("/admin/finance/categories");
  redirect("/admin/finance/categories");
}

export async function updateCategoryBudgetAction(id: string, formData: FormData) {
  const monthlyBudgetRaw = formData.get("monthlyBudget");
  await updateCategory(id, {
    monthlyBudget: monthlyBudgetRaw ? Number(monthlyBudgetRaw) : null,
  });
  revalidatePath("/admin/finance/categories");
}
