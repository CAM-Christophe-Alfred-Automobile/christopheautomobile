import { NextResponse } from "next/server";
import { adminConfig } from "@/config/admin";
import { ADMIN_SESSION_COOKIE, signSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password || password !== adminConfig.password) {
      return NextResponse.json(
        { success: false, error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = await signSession();
    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return response;
  } catch (error) {
    console.error("Erreur API Admin Login:", error);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
