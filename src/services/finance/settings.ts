import { prisma } from "@/lib/prisma";

export async function getSettings() {
  const settings = await prisma.financeSettings.findFirst();
  if (!settings) {
    throw new Error("FinanceSettings not seeded — run `npx prisma db seed`");
  }
  return settings;
}

export async function updateSettings(data: {
  urssafRatePct?: number;
  urssafFrequency?: string;
  lowBalanceThresholdPro?: number;
  lowBalanceThresholdPerso?: number;
  forecastHorizonDays?: number;
  savingsGoalAmount?: number | null;
  savingsGoalLabel?: string | null;
  savingsGoalTargetDate?: Date | null;
}) {
  const settings = await getSettings();
  return prisma.financeSettings.update({
    where: { id: settings.id },
    data,
  });
}
