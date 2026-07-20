import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ADMIN_SESSION_COOKIE, verifySession } from "@/lib/auth";
import { getPublicVehicleView } from "@/services/public/vehicle";
import PublicMaintenanceList from "@/components/public/PublicMaintenanceList";
import PublicContactForm from "@/components/public/PublicContactForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vehicle = await getPublicVehicleView(id);
  const vehicleLabel = vehicle
    ? [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Véhicule"
    : "Véhicule";
  return { title: { absolute: `${vehicleLabel} — Suivi CAM` } };
}

export default async function VehiculePublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getPublicVehicleView(id);
  if (!vehicle) notFound();

  const cookieStore = await cookies();
  const isAdmin = await verifySession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  const vehicleLabel = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "votre véhicule";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {isAdmin && (
          <Link
            href={`/admin/clients/${vehicle.clientId}`}
            className="block px-4 py-3 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold text-center"
          >
            🔧 Gérer ce véhicule / démarrer une intervention
          </Link>
        )}

        <div>
          <p className="text-sm text-gray-500">Bonjour {vehicle.client.firstName},</p>
          <h1 className="text-2xl font-semibold">{vehicleLabel}</h1>
          <p className="text-xs text-gray-500 mt-1">Suivi d&apos;entretien — CAM Christophe Auto-Mobile</p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-gray-300">Prochaines échéances</h2>
          </div>
          {vehicle.maintenanceStatus.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune donnée d&apos;entretien pour le moment.</p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">
                Un entretien fait ailleurs (ex: batterie, pneus) ? Signalez-le ci-dessous.
              </p>
              <PublicMaintenanceList items={vehicle.maintenanceStatus} vehicleId={vehicle.id} />
            </>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-300 mb-2">Historique des interventions</h2>
          {vehicle.interventions.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune intervention enregistrée pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {vehicle.interventions.map((i, idx) => (
                <li key={idx} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-500">{new Date(i.date).toLocaleDateString("fr-FR")}</span>{" "}
                  <span className="text-gray-300">— {i.description}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium text-gray-300 mb-2">Vos coordonnées</h2>
          <PublicContactForm vehicleId={vehicle.id} initial={vehicle.client} />
        </section>
      </div>
    </div>
  );
}
