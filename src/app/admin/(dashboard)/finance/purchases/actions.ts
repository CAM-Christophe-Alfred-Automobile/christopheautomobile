"use server";

import { revalidatePath } from "next/cache";
import {
  createPlannedPurchase,
  updatePlannedPurchaseStatus,
  deletePlannedPurchase,
} from "@/services/finance/plannedPurchases";

export async function createPlannedPurchaseAction(formData: FormData) {
  const priceRaw = String(formData.get("price") || "");
  const plannedDateRaw = String(formData.get("plannedDate") || "");
  const linkRaw = String(formData.get("link") || "");

  await createPlannedPurchase({
    label: String(formData.get("label")),
    link: linkRaw || null,
    price: priceRaw ? Number(priceRaw) : null,
    plannedDate: plannedDateRaw ? new Date(plannedDateRaw) : null,
    scope: String(formData.get("scope")) as "PRO" | "PERSO",
  });

  revalidatePath("/admin/finance/purchases");
  revalidatePath("/admin/finance");
}

export async function markPurchaseStatusAction(id: string, status: "planned" | "bought" | "cancelled") {
  await updatePlannedPurchaseStatus(id, status);
  revalidatePath("/admin/finance/purchases");
  revalidatePath("/admin/finance");
}

export async function deletePlannedPurchaseAction(id: string) {
  await deletePlannedPurchase(id);
  revalidatePath("/admin/finance/purchases");
  revalidatePath("/admin/finance");
}
