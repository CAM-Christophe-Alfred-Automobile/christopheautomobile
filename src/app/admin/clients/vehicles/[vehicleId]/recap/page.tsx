"use client";

import { useEffect, useState, use as usePromise } from "react";

interface MaintenanceType {
  label: string;
}

interface Intervention {
  id: string;
  date: string;
  description: string;
  normalPrice: string | number | null;
  price: string | number | null;
  photos: string[];
  maintenanceType: MaintenanceType | null;
}

interface Vehicle {
  id: string;
  plate: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  sold: boolean;
  soldAt: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
  };
  interventions: Intervention[];
}

export default function VehicleRecapPage({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}) {
  const { vehicleId } = usePromise(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/vehicles/${vehicleId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setVehicle(data.vehicle);
        setLoading(false);
      });
  }, [vehicleId]);

  if (loading) return <p className="text-gray-400 text-sm p-8">Chargement...</p>;
  if (!vehicle) return <p className="text-gray-400 text-sm p-8">Véhicule introuvable.</p>;

  const title = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Véhicule";
  const total = vehicle.interventions.reduce(
    (sum, i) => sum + (i.price != null ? Number(i.price) : 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 print:px-0 print:py-0 text-white print:text-black">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <a
          href={`/admin/clients/${vehicle.client.id}`}
          className="text-sm text-amber-400 hover:text-amber-300 cursor-pointer"
        >
          ← Retour à la fiche client
        </a>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 text-sm font-semibold"
        >
          Imprimer / Enregistrer en PDF
        </button>
      </div>

      <header className="mb-6 border-b border-gray-700 print:border-gray-300 pb-4">
        <h1 className="text-2xl font-bold">Récapitulatif d&apos;entretien</h1>
        <p className="text-lg mt-1">{title}</p>
        {vehicle.mileage != null && (
          <p className="text-sm text-gray-400 print:text-gray-600">
            Kilométrage renseigné : {vehicle.mileage.toLocaleString("fr-FR")} km
          </p>
        )}
        {vehicle.sold && (
          <p className="text-sm text-blue-400 print:text-blue-700 mt-1">
            Véhicule vendu{vehicle.soldAt ? ` le ${new Date(vehicle.soldAt).toLocaleDateString("fr-FR")}` : ""}
          </p>
        )}
        <p className="text-sm text-gray-400 print:text-gray-600 mt-2">
          Client : {vehicle.client.firstName} {vehicle.client.lastName}
          {vehicle.client.phone ? ` · ${vehicle.client.phone}` : ""}
          {vehicle.client.email ? ` · ${vehicle.client.email}` : ""}
        </p>
        <p className="text-xs text-gray-500 print:text-gray-500 mt-2">
          Document généré le {new Date().toLocaleDateString("fr-FR")} par CAM Christophe Auto-Mobile
        </p>
      </header>

      {vehicle.interventions.length === 0 ? (
        <p className="text-gray-400 print:text-gray-600">Aucune intervention enregistrée.</p>
      ) : (
        <div className="space-y-4">
          {vehicle.interventions.map((i) => (
            <div
              key={i.id}
              className="border border-gray-700 print:border-gray-300 rounded-lg p-4 break-inside-avoid"
            >
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-medium">{new Date(i.date).toLocaleDateString("fr-FR")}</span>
                {i.price != null && (
                  <span className="text-right">
                    {i.normalPrice != null && Number(i.normalPrice) > Number(i.price) && (
                      <span className="block text-xs text-gray-500 print:text-gray-500 line-through">
                        {i.normalPrice}€
                      </span>
                    )}
                    <span className="text-amber-400 print:text-amber-700">{i.price}€</span>
                    {i.normalPrice != null && Number(i.normalPrice) > Number(i.price) && (
                      <span className="ml-1 text-xs text-green-500 print:text-green-700">
                        (-{Math.round((1 - Number(i.price) / Number(i.normalPrice)) * 100)}%)
                      </span>
                    )}
                  </span>
                )}
              </div>
              {i.maintenanceType && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded border border-gray-600 print:border-gray-400 text-gray-400 print:text-gray-600">
                  {i.maintenanceType.label}
                </span>
              )}
              <p className="text-sm text-gray-300 print:text-gray-800 mt-2 whitespace-pre-wrap">
                {i.description}
              </p>
              {i.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {i.photos.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt="Photo intervention"
                      className="w-32 h-32 object-cover rounded border border-gray-700 print:border-gray-300"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <footer className="mt-6 pt-4 border-t border-gray-700 print:border-gray-300 flex justify-between font-semibold">
        <span>Total</span>
        <span>{total.toFixed(2)}€</span>
      </footer>
    </div>
  );
}
