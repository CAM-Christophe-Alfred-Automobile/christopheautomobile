import { NextResponse } from "next/server";

// Suggestions d'adresses via l'API Adresse du gouvernement français (data.gouv.fr), gratuite et sans clé.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q || q.trim().length < 3) {
    return NextResponse.json({ success: true, suggestions: [] });
  }

  const geoRes = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5&autocomplete=1`,
    { cache: "no-store" }
  );

  if (!geoRes.ok) {
    return NextResponse.json({ success: false, error: "Service de géocodage indisponible" }, { status: 502 });
  }

  const geoData = (await geoRes.json()) as {
    features: { properties: { label: string }; geometry: { coordinates: [number, number] } }[];
  };

  const suggestions = (geoData.features ?? []).map((f) => ({
    label: f.properties.label,
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0],
  }));

  return NextResponse.json({ success: true, suggestions });
}
