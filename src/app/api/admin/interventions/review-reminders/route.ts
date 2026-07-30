import { NextResponse } from "next/server";
import { listReviewReminderCandidates } from "@/services/admin/interventions";

export async function GET() {
  try {
    const interventions = await listReviewReminderCandidates();
    return NextResponse.json({ success: true, interventions });
  } catch (error) {
    console.error("Erreur API Admin Review Reminders (GET):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
