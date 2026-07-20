import { NextRequest, NextResponse } from "next/server";
import { Agent, setGlobalDispatcher } from "undici";

export const runtime = "nodejs";
export const maxDuration = 60;

// Sur certains réseaux Windows, les connexions IPv6 de fetch() restent bloquées
// silencieusement plusieurs minutes avant d'échouer. On force l'IPv4 pour éviter ça.
setGlobalDispatcher(new Agent({ connect: { family: 4 } }));

type IdentifyRequestBody = {
  images?: string[]; // data URLs: "data:image/jpeg;base64,...."
  text?: string;
};

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    part_name: {
      type: "STRING",
      description: "Nom probable de la pièce en français (ex: 'Étrier de frein avant droit').",
    },
    reference_visible: {
      type: "STRING",
      description: "Référence constructeur ou numéro de pièce lisible sur les photos, si présent.",
    },
    category: {
      type: "STRING",
      description:
        "Catégorie de la pièce (ex: freinage, moteur, suspension, carrosserie, électrique, échappement, transmission, intérieur, autre).",
    },
    candidates: {
      type: "ARRAY",
      description: "Liste des véhicules compatibles possibles, du plus probable au moins probable.",
      items: {
        type: "OBJECT",
        properties: {
          make: { type: "STRING", description: "Marque du véhicule." },
          model: { type: "STRING", description: "Modèle du véhicule." },
          years: { type: "STRING", description: "Plage d'années probable (ex: '2008-2013')." },
          confidence: { type: "NUMBER", description: "Confiance entre 0 et 1." },
          reasoning: { type: "STRING", description: "Pourquoi ce véhicule est probable." },
        },
        required: ["make", "confidence", "reasoning"],
      },
    },
    notes: {
      type: "STRING",
      description:
        "Limites de l'identification, ambiguïtés, ou conseils pour confirmer (ex: 'vérifier la référence gravée sur le carter').",
    },
  },
  required: ["part_name", "candidates"],
};

const SYSTEM_INSTRUCTION =
  "Tu es un expert en pièces détachées automobiles et moto. Tu identifies des pièces à partir de photos et/ou descriptions. Sois honnête sur l'incertitude : sans référence constructeur lisible, une identification purement visuelle est approximative. Propose plusieurs véhicules candidats avec un niveau de confiance réaliste plutôt qu'une réponse unique trop affirmative. Réponds uniquement avec le JSON demandé.";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "GEMINI_API_KEY non configurée." },
      { status: 500 }
    );
  }

  const body: IdentifyRequestBody = await req.json();
  const images = body.images ?? [];
  const text = (body.text ?? "").trim();

  if (images.length === 0 && !text) {
    return NextResponse.json(
      { success: false, error: "Fournissez au moins une photo ou une description." },
      { status: 400 }
    );
  }

  const parts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];

  for (const dataUrl of images) {
    const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
    if (!match) continue;
    const [, mimeType, base64] = match;
    parts.push({ inlineData: { mimeType, data: base64 } });
  }

  const promptText = text
    ? `Voici une pièce automobile/moto trouvée dans un garage. Description donnée par l'utilisateur : "${text}". Identifie la pièce et les véhicules compatibles possibles.`
    : "Voici une pièce automobile/moto trouvée dans un garage, sans description. Identifie la pièce et les véhicules compatibles possibles à partir des photos (forme, marquages, références visibles).";

  parts.push({ text: promptText });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const messageText = data?.error?.message ?? "Erreur inconnue";
      return NextResponse.json(
        { success: false, error: `Échec de l'appel à l'IA : ${messageText}` },
        { status: 502 }
      );
    }

    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      return NextResponse.json(
        { success: false, error: "L'IA n'a pas retourné de résultat exploitable." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, result: JSON.parse(jsonText) });
  } catch (err) {
    console.error(err);
    const messageText = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: `Échec de l'appel à l'IA : ${messageText}` },
      { status: 502 }
    );
  }
}
