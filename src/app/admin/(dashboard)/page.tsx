"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SearchField from "@/components/search/SearchField";
import AlertBadge from "@/components/admin/AlertBadge";
import type { AlertStatus } from "@/services/admin/maintenanceAlerts";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  alertStatus: AlertStatus;
  vehicles: { plate: string | null; make: string | null; model: string | null }[];
}

interface InProgressIntervention {
  id: string;
  date: string;
  vehicle: {
    make: string | null;
    model: string | null;
    plate: string | null;
    client: { id: string; firstName: string; lastName: string };
  };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [inProgress, setInProgress] = useState<InProgressIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClients(data.clients);
      })
      .finally(() => setLoading(false));
    fetch("/api/admin/interventions/in-progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInProgress(data.interventions);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? clients.filter((client) => {
          const haystack = [
            client.firstName,
            client.lastName,
            client.phone ?? "",
            client.email ?? "",
            ...client.vehicles.map((v) => `${v.plate ?? ""} ${v.make ?? ""} ${v.model ?? ""}`),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        })
      : clients;

    return [...base].sort(
      (a, b) =>
        a.lastName.localeCompare(b.lastName, "fr", { sensitivity: "base" }) ||
        a.firstName.localeCompare(b.firstName, "fr", { sensitivity: "base" })
    );
  }, [clients, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/start"
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold"
          >
            ▶ Intervention en direct
          </Link>
          <Link
            href="/admin/clients/new"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 text-sm font-semibold"
          >
            + Nouveau client
          </Link>
        </div>
      </div>

      {inProgress.length > 0 && (
        <div className="mb-6 bg-blue-950/30 border border-dashed border-blue-700/50 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-300 mb-2">
            🔧 Intervention{inProgress.length > 1 ? "s" : ""} en cours ({inProgress.length})
          </p>
          <ul className="space-y-1.5">
            {inProgress.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-gray-300">
                  {i.vehicle.client.firstName} {i.vehicle.client.lastName !== "." ? i.vehicle.client.lastName : ""} —{" "}
                  {[i.vehicle.make, i.vehicle.model, i.vehicle.plate].filter(Boolean).join(" ") || "véhicule"}
                  <span className="text-gray-500"> · depuis le {new Date(i.date).toLocaleDateString("fr-FR")}</span>
                </span>
                <Link
                  href={`/admin/interventions/${i.id}/live`}
                  className="text-xs text-amber-400 hover:text-amber-300 flex-shrink-0"
                >
                  Reprendre
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SearchField
        value={search}
        onChange={setSearch}
        showResultCount
        resultCount={filtered.length}
      />

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun client trouvé.</p>
      ) : (
        <div className="overflow-x-auto border border-gray-700 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Véhicule(s)</th>
                <th className="px-4 py-3 font-medium">Entretien</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr
                  key={client.id}
                  className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="text-white hover:text-amber-400 font-medium"
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {client.phone ?? client.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {client.vehicles.length === 0
                      ? "—"
                      : client.vehicles
                          .map((v) => [v.make, v.model, v.plate].filter(Boolean).join(" "))
                          .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AlertBadge status={client.alertStatus} />
                      {(client.alertStatus === "soon" || client.alertStatus === "overdue") &&
                        client.phone && (
                          <a
                            href={buildWhatsAppLink(
                              client.phone,
                              `Bonjour ${client.firstName}, ici CAM Christophe Auto-Mobile. Un entretien approche sur votre véhicule${
                                client.vehicles[0]
                                  ? ` (${[client.vehicles[0].make, client.vehicles[0].model]
                                      .filter(Boolean)
                                      .join(" ")})`
                                  : ""
                              }. Souhaitez-vous qu'on planifie une intervention ?`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-green-400 hover:text-green-300 cursor-pointer"
                            title="Relancer par WhatsApp"
                          >
                            Relancer
                          </a>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
