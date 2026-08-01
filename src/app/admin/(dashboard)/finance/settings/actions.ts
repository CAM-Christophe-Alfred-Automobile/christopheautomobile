"use server";

import { revalidatePath } from "next/cache";
import { updateSettings } from "@/services/finance/settings";

export async function updateSettingsAction(formData: FormData) {
  const savingsGoalRaw = String(formData.get("savingsGoalAmount") || "");
  const savingsGoalLabel = String(formData.get("savingsGoalLabel") || "") || null;
  const savingsGoalTargetDateRaw = String(formData.get("savingsGoalTargetDate") || "");

  await updateSettings({
    urssafRatePct: Number(formData.get("urssafRatePct")),
    urssafFrequency: String(formData.get("urssafFrequency")),
    lowBalanceThresholdPro: Number(formData.get("lowBalanceThresholdPro")),
    lowBalanceThresholdPerso: Number(formData.get("lowBalanceThresholdPerso")),
    forecastHorizonDays: Number(formData.get("forecastHorizonDays")),
    savingsGoalAmount: savingsGoalRaw ? Number(savingsGoalRaw) : null,
    savingsGoalLabel,
    savingsGoalTargetDate: savingsGoalTargetDateRaw ? new Date(savingsGoalTargetDateRaw) : null,
  });
  revalidatePath("/admin/finance/settings");
  revalidatePath("/admin/finance");
}
