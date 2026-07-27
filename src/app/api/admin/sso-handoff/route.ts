import { NextResponse } from "next/server";
import { signHandoffToken } from "@/lib/ssoHandoff";

export async function POST() {
  try {
    const token = await signHandoffToken();
    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Erreur API Admin SSO Handoff (POST):", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
