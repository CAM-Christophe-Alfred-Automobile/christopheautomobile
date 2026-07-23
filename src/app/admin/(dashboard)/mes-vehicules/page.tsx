"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AlertStatus } from "@/services/admin/maintenanceAlerts";

interface PersonalClientRow {
  id: string;
  firstName: string;
  lastName: string;
  alertStatus: AlertStatus;
  vehicles: { plate: string | null; make: string | null; model: string | null }[];
}

export default function MesVehiculesPage() {
  const [clients, setClients] = useState<PersonalClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/personal-vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClients(data.clients);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Mes véhicules</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ton véhicule et celui de ta femme — mêmes fonctionnalités que pour un client, mais sans prix ni envoi
            WhatsApp. Utile comme historique d&apos;entretien à présenter le jour d&apos;une revente.
          </p>
        </div>
        <Link
          href="/admin/clients/new?personal=1"
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 text-sm font-semibold whitespace-nowrap"
        >
          + Ajouter un véhicule
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : clients.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun véhicule personnel enregistré pour le moment.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors"
            >
              <p className="text-white font-medium">{client.firstName}</p>
              <p className="text-sm text-gray-400 mt-1">
                {client.vehicles.length === 0
                  ? "Aucun véhicule"
                  : client.vehicles
                      .map((v) => [v.make, v.model, v.plate].filter(Boolean).join(" "))
                      .join(", ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
