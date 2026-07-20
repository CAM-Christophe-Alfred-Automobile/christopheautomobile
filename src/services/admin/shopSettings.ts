import { prisma } from "@/lib/prisma";

export async function getShopSettings() {
  const existing = await prisma.shopSettings.findFirst();
  if (existing) return existing;
  return prisma.shopSettings.create({ data: {} });
}

export async function updateHourlyRate(hourlyRate: number) {
  const settings = await getShopSettings();
  return prisma.shopSettings.update({
    where: { id: settings.id },
    data: { hourlyRate },
  });
}
