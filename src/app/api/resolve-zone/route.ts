import { NextResponse } from "next/server";
import { resolveZone } from "@/app/data/zoneSchedule";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const latParam = url.searchParams.get("lat");
  const lonParam = url.searchParams.get("lon");

  if (!latParam || !lonParam) {
    return NextResponse.json({ success: false, error: "Coordonnées manquantes" }, { status: 400 });
  }

  const lat = parseFloat(latParam);
  const lon = parseFloat(lonParam);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ success: false, error: "Coordonnées invalides" }, { status: 400 });
  }

  const { zone, distanceKm, outOfArea } = resolveZone(lat, lon);

  return NextResponse.json({
    success: true,
    zoneKey: zone.key,
    zoneLabel: zone.label,
    distanceKm: Math.round(distanceKm * 10) / 10,
    outOfArea,
  });
}
