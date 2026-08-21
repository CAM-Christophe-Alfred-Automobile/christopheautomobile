"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchField from "@/components/search/SearchField";
import AlertBadge from "@/components/admin/AlertBadge";
import type { AlertStatus } from "@/services/admin/maintenanceAlerts";
import { buildWhatsAppLink, buildReviewReminderMessage } from "@/lib/whatsapp";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import LongPressButton from "@/components/admin/LongPressButton";

interface ClientRow {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  alertStatus: AlertStatus;
  hasUnpaid: boolean;
  unpaidAmount: number;
  vehicles: { plate: string | null; make: string | null; model: string | null }[];
}

function formatEUR(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

interface InProgressIntervention {
  id: string;
  date: string;
  status: string;
  chronoStartedAt: string | null;
  vehicle: {
    make: string | null;
    model: string | null;
    plate: string | null;
    client: { id: string; firstName: string; lastName: string };
  };
}

interface UninvoicedIntervention {
  id: string;
  date: string;
  description: string;
  total: number;
  vehicle: {
    make: string | null;
    model: string | null;
    plate: string | null;
    client: { id: string; firstName: string; lastName: string };
  };
}

interface ReviewCandidate {
  id: string;
  date: string;
  vehicle: {
    make: string | null;
    model: string | null;
    plate: string | null;
    client: { id: string; firstName: string; lastName: string; phone: string | null };
  };
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [inProgress, setInProgress] = useState<InProgressIntervention[]>([]);
  const [reviewCandidates, setReviewCandidates] = useState<ReviewCandidate[]>([]);
  const [uninvoiced, setUninvoiced] = useState<UninvoicedIntervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showClients, setShowClients] = useState(false);

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
    fetch("/api/admin/interventions/review-reminders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReviewCandidates(data.interventions);
      });
    fetch("/api/admin/interventions/uninvoiced")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUninvoiced(data.interventions);
      });
  }, []);

  async function markReviewReminderSent(id: string) {
    setReviewCandidates((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/interventions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewReminderSent: true }),
    });
  }

  async function markInvoiced(item: UninvoicedIntervention) {
    setUninvoiced((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/admin/interventions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoicedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("⚠️ Impossible d'enregistrer — connexion internet ? Réessaie.");
      setUninvoiced((prev) => [...prev, item].sort((a, b) => a.date.localeCompare(b.date)));
    }
  }

  // Finalement pas facturée — échange de bon procédé, cadeau, client qui en a ramené d'autres...
  // Repasse le prix à 0 (rien à facturer) et garde le motif pour ne pas confondre avec un prix
  // simplement oublié (voir le badge 🎁 sur la fiche client).
  async function markFree(item: UninvoicedIntervention) {
    const reason = window.prompt(
      "Motif (ex: échange de bon procédé, cadeau, client qui en a ramené d'autres...)",
      "Offert — échange de bon procédé"
    );
    if (reason == null) return;
    setUninvoiced((prev) => prev.filter((i) => i.id !== item.id));
    try {
      const res = await fetch(`/api/admin/interventions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: 0, freeReason: reason || "Offert" }),
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("⚠️ Impossible d'enregistrer — connexion internet ? Réessaie.");
      setUninvoiced((prev) => [...prev, item].sort((a, b) => a.date.localeCompare(b.date)));
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Pas de tri ici : l'API renvoie déjà les clients triés par intervention la plus récente
    // d'abord (voir listClients côté serveur) — filtrer préserve cet ordre.
    if (!q) return clients;
    return clients.filter((client) => {
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
    });
  }, [clients, search]);

  const unpaidClients = useMemo(
    () => clients.filter((c) => c.hasUnpaid).sort((a, b) => b.unpaidAmount - a.unpaidAmount),
    [clients]
  );

  useScrollRestoration(!loading);

  async function resume(i: InProgressIntervention) {
    try {
      if (i.status === "reserved") {
        const res = await fetch(`/api/admin/interventions/${i.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "draft" }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error("resume-failed");
      }
      router.push(`/admin/interventions/${i.id}/live`);
    } catch {
      alert("⚠️ Impossible de reprendre cette intervention (connexion internet ?). Réessaie.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <h1 className="text-2xl font-semibold">Accueil</h1>
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
            🔧 Intervention{inProgress.length > 1 ? "s" : ""} programmée{inProgress.length > 1 ? "s" : ""} / en cours (
            {inProgress.length})
          </p>
          <ul className="space-y-1.5">
            {inProgress.map((i) => {
              const label =
                i.status === "reserved"
                  ? "📅 Programmée"
                  : i.chronoStartedAt
                    ? "🔧 En cours"
                    : "⏸ En pause";
              return (
                <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-300">
                    <span className="text-blue-300">{label}</span> — {i.vehicle.client.firstName}{" "}
                    {i.vehicle.client.lastName !== "." ? i.vehicle.client.lastName : ""} —{" "}
                    {[i.vehicle.make, i.vehicle.model, i.vehicle.plate].filter(Boolean).join(" ") || "véhicule"}
                    <span className="text-gray-500">
                      {" "}
                      · {i.status === "reserved" ? "prévue" : "depuis"} le{" "}
                      {new Date(i.date).toLocaleDateString("fr-FR")}
                    </span>
                  </span>
                  {i.status === "reserved" ? (
                    <LongPressButton
                      onLongPress={() => resume(i)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex-shrink-0 cursor-pointer rounded px-1"
                    >
                      Démarrer (maintenir)
                    </LongPressButton>
                  ) : (
                    <button
                      onClick={() => resume(i)}
                      className="text-xs text-amber-400 hover:text-amber-300 flex-shrink-0 cursor-pointer"
                    >
                      Reprendre
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {unpaidClients.length > 0 && (
        <div className="mb-6 bg-red-950/20 border border-dashed border-red-700/50 rounded-lg p-3">
          <p className="text-sm font-medium text-red-300 mb-2">
            ⚠ Impayés ({unpaidClients.length})
          </p>
          <ul className="space-y-1.5">
            {unpaidClients.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                <Link
                  href={`/admin/clients/${c.id}`}
                  className="text-red-400 hover:text-red-300"
                >
                  {c.firstName} {c.lastName !== "." ? c.lastName : ""}
                  {c.vehicles.length > 0 && (
                    <span className="text-gray-500">
                      {" "}
                      — {c.vehicles.map((v) => [v.make, v.model, v.plate].filter(Boolean).join(" ")).join(", ")}
                    </span>
                  )}
                </Link>
                <span className="text-red-400 font-medium flex-shrink-0">{formatEUR(c.unpaidAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reviewCandidates.length > 0 && (
        <div className="mb-6 bg-yellow-950/20 border border-dashed border-yellow-700/50 rounded-lg p-3">
          <p className="text-sm font-medium text-yellow-300 mb-2">
            ⭐ Rappels — demander un avis Google ({reviewCandidates.length})
          </p>
          <ul className="space-y-1.5">
            {reviewCandidates.map((i) => {
              const vehicleLabel =
                [i.vehicle.make, i.vehicle.model, i.vehicle.plate].filter(Boolean).join(" ") || "véhicule";
              return (
                <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-gray-300">
                    {i.vehicle.client.firstName} {i.vehicle.client.lastName !== "." ? i.vehicle.client.lastName : ""}{" "}
                    — {vehicleLabel}
                    <span className="text-gray-500"> · terminée le {new Date(i.date).toLocaleDateString("fr-FR")}</span>
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {i.vehicle.client.phone && (
                      <a
                        href={buildWhatsAppLink(
                          i.vehicle.client.phone,
                          buildReviewReminderMessage({ firstName: i.vehicle.client.firstName, vehicleLabel })
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => markReviewReminderSent(i.id)}
                        className="text-xs text-green-400 hover:text-green-300 cursor-pointer"
                      >
                        📱 Envoyer
                      </a>
                    )}
                    <button
                      onClick={() => markReviewReminderSent(i.id)}
                      className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
                      title="Ne plus proposer pour cette intervention"
                    >
                      Ignorer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {uninvoiced.length > 0 && (
        <div className="mb-6 bg-purple-950/20 border border-dashed border-purple-700/50 rounded-lg p-3">
          <p className="text-sm font-medium text-purple-300 mb-2">
            🧾 Factures à faire ({uninvoiced.length})
          </p>
          <ul className="space-y-1.5">
            {uninvoiced.map((i) => {
              const vehicleLabel =
                [i.vehicle.make, i.vehicle.model, i.vehicle.plate].filter(Boolean).join(" ") || "véhicule";
              return (
                <li key={i.id} className="flex items-center gap-2 text-sm">
                  <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={() => markInvoiced(i)}
                      title="Cocher : facture faite"
                      className="flex-shrink-0 w-4 h-4 accent-purple-500 cursor-pointer"
                    />
                    <Link
                      href={`/admin/clients/${i.vehicle.client.id}`}
                      className="text-gray-300 hover:text-purple-300 truncate"
                    >
                      {i.vehicle.client.firstName} {i.vehicle.client.lastName !== "." ? i.vehicle.client.lastName : ""}
                      <span className="text-gray-500">
                        {" "}
                        — {vehicleLabel} · {new Date(i.date).toLocaleDateString("fr-FR")}
                      </span>
                    </Link>
                  </label>
                  <button
                    type="button"
                    onClick={() => markFree(i)}
                    title="Finalement pas facturée : échange de bon procédé, cadeau, client qui en a ramené d'autres..."
                    className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded border border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
                  >
                    🎁 Offert
                  </button>
                  <span className="text-purple-300 font-medium flex-shrink-0">{formatEUR(i.total)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowClients((v) => !v)}
        className="w-full flex items-center justify-between gap-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-3 cursor-pointer text-left"
      >
        <span className="text-sm font-medium text-gray-200">
          👥 Clients {!loading && `(${clients.length})`}
        </span>
        <span className="text-gray-500 text-sm">{showClients ? "▲ Fermer" : "▼ Ouvrir"}</span>
      </button>

      {showClients && (
        <>
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
                <th className="px-4 py-3 font-medium">Paiement</th>
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
                      className={`font-medium ${client.hasUnpaid ? "text-red-400 hover:text-red-300" : "text-white hover:text-amber-400"}`}
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
                  <td className="px-4 py-3">
                    {client.hasUnpaid && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                        ⚠ Impayé
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
