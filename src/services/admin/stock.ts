import { prisma } from "@/lib/prisma";

export interface StockPartInput {
  name: string;
  reference?: string | null;
  category?: string | null;
  quantity?: number;
  location?: string | null;
  condition?: string | null;
  notes?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehicleYears?: string | null;
  aiSummary?: string | null;
}

export async function listStockParts(query?: string) {
  return prisma.stockPart.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { reference: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { vehicleMake: { contains: query, mode: "insensitive" } },
            { vehicleModel: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { photos: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getStockPart(id: string) {
  return prisma.stockPart.findUnique({
    where: { id },
    include: { photos: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createStockPart(data: StockPartInput) {
  return prisma.stockPart.create({ data });
}

export async function updateStockPart(id: string, data: Partial<StockPartInput>) {
  return prisma.stockPart.update({ where: { id }, data });
}

export async function deleteStockPart(id: string) {
  return prisma.stockPart.delete({ where: { id } });
}

export async function addStockPhoto(stockPartId: string, url: string) {
  return prisma.stockPhoto.create({ data: { stockPartId, url } });
}

export async function removeStockPhoto(id: string) {
  return prisma.stockPhoto.delete({ where: { id } });
}
