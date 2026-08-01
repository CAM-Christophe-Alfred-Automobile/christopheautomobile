import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    amount: { type: "NUMBER", description: "Montant total TTC payé, en euros. null si illisible." },
    date: { type: "STRING", description: "Date du ticket au format YYYY-MM-DD. null si illisible." },
    merchant: { type: "STRING", description: "Nom du commerçant/enseigne, si visible." },
    category: {
      type: "STRING",
      description: "Catégorie la plus probable parmi : Courses, Carburant, Péage, Santé, Autre.",
    },
  },
  required: ["amount"],
};

const SYSTEM_INSTRUCTION =
  "Tu lis des tickets de caisse et reçus photographiés pour un artisan mécanicien auto-entrepreneur. Extrais le montant total payé, la date, le commerçant et une catégorie de dépense. Réponds uniquement avec le JSON demandé, sans texte autour.";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY non configurée." }, { status: 500 });
  }

  const body = (await req.json()) as { image?: string };
  const dataUrl = body.image;
  const match = dataUrl ? /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl) : null;
  if (!match) {
    return NextResponse.json({ success: false, error: "Image manquante ou invalide." }, { status: 400 });
  }
  const [, mimeType, base64] = match;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inlineData: { mimeType, data: base64 } },
                { text: "Voici un ticket de caisse ou un reçu. Extrais les informations demandées." },
              ],
            },
          ],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      const messageText = data?.error?.message ?? "Erreur inconnue";
      return NextResponse.json({ success: false, error: `Échec de l'appel à l'IA : ${messageText}` }, { status: 502 });
    }

    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      return NextResponse.json({ success: false, error: "L'IA n'a pas retourné de résultat exploitable." }, { status: 502 });
    }

    return NextResponse.json({ success: true, result: JSON.parse(jsonText) });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: `Échec de l'appel à l'IA : ${messageText}` }, { status: 502 });
  }
}
