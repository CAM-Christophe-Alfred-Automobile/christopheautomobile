import { NextResponse } from "next/server";
import { sendWeeklySummaryEmail } from "@/services/finance/weeklySummary";

const RECIPIENT = "christophe.auto.pro@gmail.com";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  await sendWeeklySummaryEmail(RECIPIENT);

  return NextResponse.json({ success: true });
}
