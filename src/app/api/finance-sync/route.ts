import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_LOOKBACK_DAYS = 180;

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.FINANCE_SYNC_API_KEY) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sinceParam = url.searchParams.get("since");
  const since = sinceParam
    ? new Date(sinceParam)
    : new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);

  const rows = await prisma.payment.findMany({
    where: { method: "cash", date: { gte: since } },
    include: { intervention: { include: { vehicle: { include: { client: true } } } } },
    orderBy: { date: "asc" },
  });

  const payments = rows.map((p) => ({
    id: p.id,
    date: p.date.toISOString(),
    amount: Number(p.amount),
    description: [
      `${p.intervention.vehicle.client.firstName} ${p.intervention.vehicle.client.lastName}`.trim(),
      `${p.intervention.vehicle.make} ${p.intervention.vehicle.model}`.trim(),
      p.intervention.description,
    ]
      .filter(Boolean)
      .join(" — "),
  }));

  return NextResponse.json({ success: true, payments });
}
