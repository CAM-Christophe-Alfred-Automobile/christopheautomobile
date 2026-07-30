import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVehicleCarnet } from "@/services/public/vehicle";
import PrintButton from "@/components/public/PrintButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getVehicleCarnet(id);
  const vehicleLabel = vehicle
    ? [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Véhicule"
    : "Véhicule";
  return { title: { absolute: `Carnet d'entretien — ${vehicleLabel}` } };
}

export default async function VehicleCarnetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleCarnet(id);
  if (!vehicle) notFound();

  const title = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Véhicule";
  const total = vehicle.interventions.reduce((sum, i) => sum + (i.price ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 print:px-0 print:py-0 bg-gray-950 text-white print:bg-white print:text-black min-h-screen">
      <div className="flex items-center justify-end mb-6 print:hidden">
        <PrintButton />
      </div>

      <header className="mb-6 border-b border-gray-700 print:border-gray-300 pb-4 flex items-center gap-4">
        <Image
          src="/images/CAM-blanc-complet.webp"
          alt="CAM"
          width={48}
          height={48}
          className="h-12 w-auto print:hidden"
        />
        <div>
          <h1 className="text-2xl font-bold">Carnet d&apos;entretien</h1>
          <p className="text-lg mt-1">{title}</p>
          {vehicle.mileage != null && (
            <p className="text-sm text-gray-400 print:text-gray-600">
              Kilométrage renseigné : {vehicle.mileage.toLocaleString("fr-FR")} km
            </p>
          )}
          <p className="text-xs text-gray-500 print:text-gray-500 mt-2">
            Document généré le {new Date().toLocaleDateString("fr-FR")} par CAM Christophe Auto-Mobile — mécanicien
            à domicile
          </p>
        </div>
      </header>

      {vehicle.interventions.length === 0 ? (
        <p className="text-gray-400 print:text-gray-600">Aucune intervention enregistrée pour ce véhicule.</p>
      ) : (
        <div className="space-y-4">
          {vehicle.interventions.map((i) => (
            <div
              key={i.id}
              className="border border-gray-700 print:border-gray-300 rounded-lg p-4 break-inside-avoid"
            >
              <div className="flex justify-between items-baseline gap-2 flex-wrap">
                <span className="font-medium">
                  {new Date(i.date).toLocaleDateString("fr-FR")}
                  {i.endDate && i.endDate !== i.date && ` → ${new Date(i.endDate).toLocaleDateString("fr-FR")}`}
                </span>
                {i.price != null && <span className="text-amber-400 print:text-amber-700">{i.price}€</span>}
              </div>
              {i.maintenanceType && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded border border-gray-600 print:border-gray-400 text-gray-400 print:text-gray-600">
                  {i.maintenanceType}
                </span>
              )}
              <p className="text-sm text-gray-300 print:text-gray-800 mt-2 whitespace-pre-wrap">{i.description}</p>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-6 pt-4 border-t border-gray-700 print:border-gray-300 flex justify-between font-semibold">
        <span>Total facturé (historique)</span>
        <span>{total.toFixed(2)}€</span>
      </footer>
    </div>
  );
}
