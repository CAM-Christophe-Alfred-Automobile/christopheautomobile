import { NextResponse } from "next/server";
import { google } from "googleapis";

const CALCOM_API_VERSION = "2024-08-13";

const REASON_LABELS: Record<string, { emoji: string; label: string }> = {
  vacation: { emoji: "🏖️", label: "Vacances" },
  travel: { emoji: "✈️", label: "Voyage" },
  sick: { emoji: "🤒", label: "Congé maladie" },
  publicHoliday: { emoji: "🎌", label: "Jour férié" },
  unspecified: { emoji: "🕒", label: "Absence (non spécifiée)" },
};

const TOMATO_COLOR_ID = "11";

type OooEntry = {
  id: number;
  start: string;
  end: string;
  reason: string;
};

function toGoogleAllDayDates(entry: OooEntry) {
  const start = entry.start.slice(0, 10);
  const endExclusive = new Date(entry.end);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  const end = endExclusive.toISOString().slice(0, 10);
  return { start, end };
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 });
  }

  const oooRes = await fetch("https://api.cal.com/v2/me/ooo", {
    headers: {
      Authorization: `Bearer ${process.env.CALCOM_API_KEY}`,
      "cal-api-version": CALCOM_API_VERSION,
    },
    cache: "no-store",
  });

  if (!oooRes.ok) {
    return NextResponse.json(
      { success: false, error: `Cal.com API error (${oooRes.status})` },
      { status: 502 }
    );
  }

  const { data: entries }: { data: OooEntry[] } = await oooRes.json();

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  const calendar = google.calendar({ version: "v3", auth });
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;

  let created = 0;

  for (const entry of entries) {
    const existing = await calendar.events.list({
      calendarId,
      privateExtendedProperty: [`calcomOooId=${entry.id}`],
      maxResults: 1,
    });
    if (existing.data.items && existing.data.items.length > 0) continue;

    const { emoji, label } = REASON_LABELS[entry.reason] ?? REASON_LABELS.unspecified;
    const { start, end } = toGoogleAllDayDates(entry);

    await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${emoji} ${label}`,
        start: { date: start },
        end: { date: end },
        colorId: TOMATO_COLOR_ID,
        extendedProperties: { private: { calcomOooId: String(entry.id) } },
      },
    });
    created++;
  }

  return NextResponse.json({ success: true, total: entries.length, created });
}
