import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

/**
 * Relay used by Finance Copilot to send its weekly summary email — reuses this
 * site's SMTP credentials so they never need to be duplicated into the other app.
 */
export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.FINANCE_SYNC_API_KEY) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  const { to, subject, html } = (await req.json()) as { to?: string; subject?: string; html?: string };
  if (!to || !subject || !html) {
    return NextResponse.json({ success: false, error: "Champs manquants (to, subject, html)" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: siteConfig.smtp.host,
    port: siteConfig.smtp.port,
    auth: { user: siteConfig.smtp.user, pass: siteConfig.smtp.pass },
  });

  await transporter.sendMail({ from: siteConfig.smtp.from, to, subject, html });

  return NextResponse.json({ success: true });
}
