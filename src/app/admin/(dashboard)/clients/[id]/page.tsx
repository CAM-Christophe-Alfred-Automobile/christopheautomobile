"use client";

import { useCallback, useEffect, useRef, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import AlertBadge from "@/components/admin/AlertBadge";
import VehicleQrCode from "@/components/admin/VehicleQrCode";
import { computeMaintenanceAlert } from "@/services/admin/maintenanceAlerts";
import { buildWhatsAppLink, buildRelanceMessage, buildQuoteMessage, buildPartsOrderMessage } from "@/lib/whatsapp";
import { MAINTENANCE_PART_HINTS, buildSupplierSearchUrl } from "@/lib/maintenancePartHints";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white " +
  "placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

interface MaintenanceType {
  id: string;
  key: string;
  label: string;
  defaultIntervalMonths: number | null;
  defaultIntervalKm: number | null;
  isActive: boolean;
}

interface MaintenanceRecord {
  id: string;
  maintenanceTypeId: string;
  maintenanceType: MaintenanceType;
  lastDoneDate: string | null;
  lastDoneMileage: number | null;
  intervalMonthsOverride: number | null;
  intervalKmOverride: number | null;
  updatedByClient: boolean;
}

interface PartUsed {
  id: string;
  designation: string;
  reference: string | null;
  quantity: string | null;
  link: string | null;
  price: string | number | null;
  boughtByClient: boolean;
  stockPartId: string | null;
}

interface Payment {
  id: string;
  amount: string | number;
  method: string | null;
  date: string;
  note: string | null;
}

interface Intervention {
  id: string;
  date: string;
  endDate: string | null;
  description: string;
  normalPrice: string | number | null;
  price: string | number | null;
  photos: string[];
  photosBefore: string[];
  photosAfter: string[];
  notes: string | null;
  toolLink: string | null;
  vehicleCondition: string | null;
  mileage: number | null;
  hoursSpent: string | number | null;
  partsUsed: PartUsed[];
  payments: Payment[];
  maintenanceTypeId: string | null;
  maintenanceType: MaintenanceType | null;
  status: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  card: "Carte",
  transfer: "Virement",
  check: "Chèque",
};

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: "💵",
  card: "💳",
  transfer: "🏦",
  check: "🧾",
};

interface PlannedRepair {
  id: string;
  description: string;
  targetDate: string | null;
  status: string;
  priority: string;
  partsNote: string | null;
  estimatedPrice: string | number | null;
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
  previousOwnerName: string | null;
  interventions: Intervention[];
  plannedRepairs: PlannedRepair[];
  maintenanceRecords: MaintenanceRecord[];
}

interface ClientDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  isPersonal: boolean;
  vehicles: Vehicle[];
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [hourlyRate, setHourlyRate] = useState(60);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState(false);
  const [clientDraft, setClientDraft] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  });

  function startEditClient() {
    if (!client) return;
    setClientDraft({
      firstName: client.firstName,
      lastName: client.lastName === "." ? "" : client.lastName,
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
    });
    setEditingClient(true);
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: clientDraft.firstName,
        lastName: clientDraft.lastName || ".",
        phone: clientDraft.phone || null,
        email: clientDraft.email || null,
        address: clientDraft.address || null,
      }),
    });
    setEditingClient(false);
    load();
  }

  async function deleteClient() {
    if (!client) return;
    if (
      !confirm(
        `Supprimer définitivement "${client.firstName} ${client.lastName}" ? Tous ses véhicules, interventions, photos et réparations prévues seront perdus. Cette action est irréversible.`
      )
    )
      return;
    await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
    router.push("/admin");
  }

  const load = useCallback(async () => {
    const [clientRes, typesRes, settingsRes] = await Promise.all([
      fetch(`/api/admin/clients/${id}`).then((r) => r.json()),
      fetch(`/api/admin/maintenance-types`).then((r) => r.json()),
      fetch(`/api/admin/shop-settings`).then((r) => r.json()),
    ]);
    if (clientRes.success) setClient(clientRes.client);
    if (typesRes.success) setMaintenanceTypes(typesRes.types);
    if (settingsRes.success) setHourlyRate(Number(settingsRes.settings.hourlyRate));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-gray-400 text-sm">Chargement...</p>;
  if (!client) return <p className="text-gray-400 text-sm">Client introuvable.</p>;

  return (
    <div className="space-y-8">
      <div>
        {editingClient ? (
          <form
            onSubmit={saveClient}
            className="border border-gray-700 rounded-xl p-4 space-y-2 max-w-md"
          >
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Prénom"
                required
                className={inputClass}
                value={clientDraft.firstName}
                onChange={(e) => setClientDraft((c) => ({ ...c, firstName: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Nom"
                className={inputClass}
                value={clientDraft.lastName}
                onChange={(e) => setClientDraft((c) => ({ ...c, lastName: e.target.value }))}
              />
            </div>
            <input
              type="text"
              placeholder="Téléphone"
              className={inputClass}
              value={clientDraft.phone}
              onChange={(e) => setClientDraft((c) => ({ ...c, phone: e.target.value }))}
            />
            <input
              type="email"
              placeholder="Email"
              className={inputClass}
              value={clientDraft.email}
              onChange={(e) => setClientDraft((c) => ({ ...c, email: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Adresse"
              className={inputClass}
              value={clientDraft.address}
              onChange={(e) => setClientDraft((c) => ({ ...c, address: e.target.value }))}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingClient(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-600 text-xs cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">
                {client.firstName} {client.lastName}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {[client.phone, client.email, client.address].filter(Boolean).join(" · ") || "Aucune coordonnée"}
              </p>
              {client.notes && <p className="text-gray-500 text-sm mt-2 whitespace-pre-wrap">{client.notes}</p>}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={startEditClient}
                className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                Modifier les coordonnées
              </button>
              <button
                onClick={deleteClient}
                className="text-xs text-gray-500 hover:text-red-400 cursor-pointer"
              >
                Supprimer le client
              </button>
            </div>
          </div>
        )}
      </div>

      {client.vehicles.map((vehicle) => (
        <VehiclePanel
          key={vehicle.id}
          vehicle={vehicle}
          maintenanceTypes={maintenanceTypes}
          clientFirstName={client.firstName}
          clientPhone={client.phone}
          clientEmail={client.email}
          hourlyRate={hourlyRate}
          isPersonal={client.isPersonal}
          onChanged={load}
        />
      ))}

      <AddVehicleForm clientId={client.id} onAdded={load} />
    </div>
  );
}

function ReassignOwnerButton({ vehicleId, vehicleTitle }: { vehicleId: string; vehicleTitle: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/admin/clients?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setResults(d.clients.slice(0, 6));
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, open]);

  async function reassignTo(newClientId: string) {
    if (!confirm(`Changer le propriétaire de "${vehicleTitle}" ?`)) return;
    setSaving(true);
    const res = await fetch(`/api/admin/vehicles/${vehicleId}/reassign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newClientId }),
    }).then((r) => r.json());
    setSaving(false);
    if (res.success) router.push(`/admin/clients/${res.vehicle.clientId}`);
  }

  async function createAndReassign(e: React.FormEvent) {
    e.preventDefault();
    if (!newFirstName || !newLastName) return;
    if (
      !confirm(
        `Changer le propriétaire de "${vehicleTitle}" vers un nouveau client "${newFirstName} ${newLastName}" ?`
      )
    )
      return;
    setSaving(true);
    const res = await fetch(`/api/admin/vehicles/${vehicleId}/reassign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newClient: { firstName: newFirstName, lastName: newLastName, phone: newPhone || null },
      }),
    }).then((r) => r.json());
    setSaving(false);
    if (res.success) router.push(`/admin/clients/${res.vehicle.clientId}`);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gray-400 hover:text-white cursor-pointer">
        🔄 Changer de propriétaire
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-300">Changer de propriétaire</p>
          <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-300 cursor-pointer text-sm">
            ✕
          </button>
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-0.5">Client existant</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client..."
            className={inputClass}
          />
          {results.length > 0 && (
            <ul className="mt-1 border border-gray-700 rounded-lg overflow-hidden">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => reassignTo(c.id)}
                    disabled={saving}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800 cursor-pointer disabled:opacity-50"
                  >
                    {c.firstName} {c.lastName !== "." ? c.lastName : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="pt-2 border-t border-gray-800">
          <p className="text-[11px] text-gray-500 mb-1">Ou nouveau client</p>
          <form onSubmit={createAndReassign} className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Prénom"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Nom"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                className={inputClass}
              />
            </div>
            <input
              placeholder="Téléphone (optionnel)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className={inputClass}
            />
            <button
              type="submit"
              disabled={saving || !newFirstName || !newLastName}
              className="w-full text-xs px-3 py-1.5 rounded bg-amber-500 text-gray-900 font-semibold disabled:opacity-50 cursor-pointer"
            >
              Créer et assigner
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function VehiclePanel({
  vehicle,
  maintenanceTypes,
  clientFirstName,
  clientPhone,
  clientEmail,
  hourlyRate,
  isPersonal,
  onChanged,
}: {
  vehicle: Vehicle;
  maintenanceTypes: MaintenanceType[];
  clientFirstName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  hourlyRate: number;
  isPersonal: boolean;
  onChanged: () => void;
}) {
  const title = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "Véhicule";
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleDraft, setVehicleDraft] = useState({
    make: vehicle.make ?? "",
    model: vehicle.model ?? "",
    plate: vehicle.plate ?? "",
    mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
  });

  function startEditVehicle() {
    setVehicleDraft({
      make: vehicle.make ?? "",
      model: vehicle.model ?? "",
      plate: vehicle.plate ?? "",
      mileage: vehicle.mileage != null ? String(vehicle.mileage) : "",
    });
    setEditingVehicle(true);
  }

  async function saveVehicle(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/vehicles/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: vehicleDraft.make || null,
        model: vehicleDraft.model || null,
        plate: vehicleDraft.plate || null,
        mileage: vehicleDraft.mileage ? Number(vehicleDraft.mileage) : null,
      }),
    });
    setEditingVehicle(false);
    onChanged();
  }

  async function toggleSold() {
    const nextSold = !vehicle.sold;
    if (nextSold && !confirm(`Marquer "${title}" comme vendu ? Il ne recevra plus de relances d'entretien.`)) {
      return;
    }
    await fetch(`/api/admin/vehicles/${vehicle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sold: nextSold }),
    });
    onChanged();
  }

  async function deleteVehicle() {
    if (
      !confirm(
        `Supprimer définitivement "${title}" ? Tout son historique d'interventions, photos et réparations prévues sera perdu.`
      )
    )
      return;
    await fetch(`/api/admin/vehicles/${vehicle.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <section
      className={`border rounded-xl p-4 space-y-6 ${vehicle.sold ? "border-blue-700/50 bg-blue-950/10" : "border-gray-700"}`}
    >
      {editingVehicle ? (
        <form onSubmit={saveVehicle} className="space-y-2 max-w-md">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Marque"
              className={inputClass}
              value={vehicleDraft.make}
              onChange={(e) => setVehicleDraft((v) => ({ ...v, make: e.target.value }))}
            />
            <input
              type="text"
              placeholder="Modèle"
              className={inputClass}
              value={vehicleDraft.model}
              onChange={(e) => setVehicleDraft((v) => ({ ...v, model: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Plaque"
              className={inputClass}
              value={vehicleDraft.plate}
              onChange={(e) => setVehicleDraft((v) => ({ ...v, plate: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Km"
              className={inputClass}
              value={vehicleDraft.mileage}
              onChange={(e) => setVehicleDraft((v) => ({ ...v, mileage: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditingVehicle(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-600 text-xs cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {vehicle.sold && <AlertBadge status="sold" />}
          </div>
          <div className="flex items-center gap-3">
            {vehicle.mileage != null && (
              <span className="text-sm text-gray-400">{vehicle.mileage.toLocaleString("fr-FR")} km</span>
            )}
            <a
              href={`/admin/clients/vehicles/${vehicle.id}/recap`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Récapitulatif
            </a>
            <VehicleQrCode vehicleId={vehicle.id} />
            <button onClick={startEditVehicle} className="text-xs text-gray-400 hover:text-white cursor-pointer">
              Modifier
            </button>
            <ReassignOwnerButton vehicleId={vehicle.id} vehicleTitle={title} />
            <button
              onClick={toggleSold}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              {vehicle.sold ? "Remettre en circulation" : "Marquer comme vendu"}
            </button>
            <button
              onClick={deleteVehicle}
              className="text-xs text-gray-500 hover:text-red-400 cursor-pointer"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {vehicle.previousOwnerName && (
        <p className="text-[11px] text-gray-500 -mt-4">Anciennement à : {vehicle.previousOwnerName}</p>
      )}

      {vehicle.sold ? (
        <p className="text-xs text-blue-400">
          Véhicule vendu{vehicle.soldAt ? ` le ${new Date(vehicle.soldAt).toLocaleDateString("fr-FR")}` : ""} — plus
          d&apos;alertes d&apos;entretien, historique et récapitulatif toujours disponibles.
        </p>
      ) : (
        <MaintenancePanel
          vehicle={vehicle}
          maintenanceTypes={maintenanceTypes}
          clientFirstName={clientFirstName}
          clientPhone={clientPhone}
          isPersonal={isPersonal}
          onChanged={onChanged}
        />
      )}
      <InterventionHistory
        vehicle={vehicle}
        maintenanceTypes={maintenanceTypes}
        hourlyRate={hourlyRate}
        isPersonal={isPersonal}
        clientFirstName={clientFirstName}
        clientPhone={clientPhone}
        onChanged={onChanged}
      />
      <PlannedRepairsPanel
        vehicle={vehicle}
        clientFirstName={clientFirstName}
        clientPhone={clientPhone}
        clientEmail={clientEmail}
        isPersonal={isPersonal}
        onChanged={onChanged}
      />
    </section>
  );
}

function MaintenancePanel({
  vehicle,
  maintenanceTypes,
  clientFirstName,
  clientPhone,
  isPersonal,
  onChanged,
}: {
  vehicle: Vehicle;
  maintenanceTypes: MaintenanceType[];
  clientFirstName: string;
  clientPhone: string | null;
  isPersonal: boolean;
  onChanged: () => void;
}) {
  const vehicleLabel = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "votre véhicule";
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [partsHintTypeId, setPartsHintTypeId] = useState<string | null>(null);
  const [lastDoneDate, setLastDoneDate] = useState("");
  const [lastDoneMileage, setLastDoneMileage] = useState("");
  const [intervalOverride, setIntervalOverride] = useState("");
  const [intervalKmOverride, setIntervalKmOverride] = useState("");

  const recordByType = new Map(vehicle.maintenanceRecords.map((r) => [r.maintenanceTypeId, r]));

  function startEdit(record: MaintenanceRecord | undefined, type: MaintenanceType) {
    setEditingTypeId(type.id);
    setLastDoneDate(record?.lastDoneDate ? record.lastDoneDate.slice(0, 10) : "");
    setLastDoneMileage(record?.lastDoneMileage?.toString() ?? "");
    setIntervalOverride(record?.intervalMonthsOverride?.toString() ?? "");
    setIntervalKmOverride(record?.intervalKmOverride?.toString() ?? "");
  }

  async function saveEdit(typeId: string) {
    await fetch(`/api/admin/vehicles/${vehicle.id}/maintenance-records`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maintenanceTypeId: typeId,
        lastDoneDate: lastDoneDate || null,
        lastDoneMileage: lastDoneMileage ? Number(lastDoneMileage) : null,
        intervalMonthsOverride: intervalOverride ? Number(intervalOverride) : null,
        intervalKmOverride: intervalKmOverride ? Number(intervalKmOverride) : null,
      }),
    });
    setEditingTypeId(null);
    onChanged();
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2">Entretien</h3>
      <div className="grid sm:grid-cols-2 gap-2">
        {maintenanceTypes
          .filter((t) => t.defaultIntervalMonths != null || t.defaultIntervalKm != null)
          .filter((t) => t.isActive)
          .map((type) => {
            const record = recordByType.get(type.id);
            const interval = record?.intervalMonthsOverride ?? type.defaultIntervalMonths;
            const intervalKm = record?.intervalKmOverride ?? type.defaultIntervalKm;
            const lastDone = record?.lastDoneDate ? new Date(record.lastDoneDate) : null;
            const alert = computeMaintenanceAlert(lastDone, interval, new Date(), 30, {
              lastDoneMileage: record?.lastDoneMileage ?? null,
              intervalKm,
              currentMileage: vehicle.mileage,
            });
            const lastIntervention = vehicle.interventions
              .filter((i) => i.maintenanceTypeId === type.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            return (
              <div key={type.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm">{type.label}</span>
                  <div className="flex items-center gap-1.5">
                    {record?.updatedByClient && (
                      <span
                        className="inline-flex items-center text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded border bg-purple-600/20 border-purple-600/50 text-purple-400"
                        title="Signalé par le client via sa fiche de suivi — à vérifier"
                      >
                        🙋 Client
                      </span>
                    )}
                    {!isPersonal && (alert.status === "soon" || alert.status === "overdue") && clientPhone && (
                      <a
                        href={buildWhatsAppLink(
                          clientPhone,
                          buildRelanceMessage({
                            firstName: clientFirstName,
                            vehicleLabel,
                            maintenanceLabel: type.label,
                            status: alert.status,
                            lastDoneDate: record?.lastDoneDate ?? null,
                          })
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-400 hover:text-green-300 cursor-pointer"
                        title="Relancer par WhatsApp"
                      >
                        Relancer
                      </a>
                    )}
                    <AlertBadge status={alert.status} />
                  </div>
                </div>

                {MAINTENANCE_PART_HINTS[type.key] && (
                  <div className="mt-1">
                    <button
                      onClick={() => setPartsHintTypeId(partsHintTypeId === type.id ? null : type.id)}
                      className="text-[11px] text-gray-500 hover:text-amber-400 cursor-pointer"
                    >
                      🛒 Pièces nécessaires {partsHintTypeId === type.id ? "▲" : "▼"}
                    </button>
                    {partsHintTypeId === type.id && (
                      <div className="mt-1 space-y-1">
                        {vehicle.plate && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(vehicle.plate!);
                              window.open("https://www.auto-doc.fr/", "_blank");
                            }}
                            className="text-[11px] text-green-400 hover:text-green-300 cursor-pointer text-left"
                            title="Copie la plaque et ouvre Autodoc — colle-la dans le champ immatriculation pour filtrer toutes les pièces sur ce véhicule exact"
                          >
                            🚗 Copier la plaque ({vehicle.plate}) + ouvrir Autodoc
                          </button>
                        )}
                        <ul className="space-y-0.5">
                          {MAINTENANCE_PART_HINTS[type.key].map((partTerm) => (
                            <li key={partTerm}>
                              <a
                                href={buildSupplierSearchUrl(partTerm, vehicle.make, vehicle.model)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-amber-400 hover:text-amber-300"
                                title={`Chercher "${partTerm}" pour ce véhicule sur Autodoc`}
                              >
                                🔍 {partTerm}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {editingTypeId === type.id ? (
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className={inputClass}
                        value={lastDoneDate}
                        onChange={(e) => setLastDoneDate(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Km au moment"
                        className={inputClass}
                        value={lastDoneMileage}
                        onChange={(e) => setLastDoneMileage(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={
                          type.defaultIntervalMonths ? `Défaut : ${type.defaultIntervalMonths} mois` : "Mois"
                        }
                        className={inputClass}
                        value={intervalOverride}
                        onChange={(e) => setIntervalOverride(e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder={type.defaultIntervalKm ? `Défaut : ${type.defaultIntervalKm} km` : "Km"}
                        className={inputClass}
                        value={intervalKmOverride}
                        onChange={(e) => setIntervalKmOverride(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(type.id)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingTypeId(null)}
                        className="px-3 py-1.5 rounded-lg border border-gray-600 text-xs cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(record, type)}
                    className="mt-1 text-xs text-gray-400 hover:text-amber-400 cursor-pointer"
                  >
                    {lastDone
                      ? `Dernier : ${lastDone.toLocaleDateString("fr-FR")}${
                          record?.lastDoneMileage != null ? ` (${record.lastDoneMileage.toLocaleString("fr-FR")} km)` : ""
                        }${alert.nextDueKm != null ? ` — prochain à ${alert.nextDueKm.toLocaleString("fr-FR")} km` : ""}`
                      : "Aucune donnée — cliquer pour renseigner"}
                  </button>
                )}

                {lastIntervention &&
                  (lastIntervention.notes || lastIntervention.partsUsed.length > 0) && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-700/60 text-[11px] text-gray-500 space-y-1">
                      {lastIntervention.notes && (
                        <div className="whitespace-pre-wrap">📝 {lastIntervention.notes}</div>
                      )}
                      {lastIntervention.partsUsed.length > 0 && (
                        <div>
                          🔧{" "}
                          {lastIntervention.partsUsed
                            .map(
                              (p) =>
                                p.designation +
                                (p.quantity ? ` (${p.quantity})` : "") +
                                (p.reference ? ` — réf. ${p.reference}` : "")
                            )
                            .join(" · ")}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

function InterventionHistory({
  vehicle,
  maintenanceTypes,
  hourlyRate,
  isPersonal,
  clientFirstName,
  clientPhone,
  onChanged,
}: {
  vehicle: Vehicle;
  maintenanceTypes: MaintenanceType[];
  hourlyRate: number;
  isPersonal: boolean;
  clientFirstName: string;
  clientPhone: string | null;
  onChanged: () => void;
}) {
  const router = useRouter();
  const [startingLive, setStartingLive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [hoursSpent, setHoursSpent] = useState("");
  const [maintenanceTypeId, setMaintenanceTypeId] = useState("");
  const [notes, setNotes] = useState("");
  const [vehicleCondition, setVehicleCondition] = useState("");
  const [todoText, setTodoText] = useState("");
  const [todoPriority, setTodoPriority] = useState<"normal" | "urgent">("normal");
  const [queuedParts, setQueuedParts] = useState<
    {
      designation: string;
      reference: string;
      quantity: string;
      link: string;
      price: string;
      boughtByClient: boolean;
    }[]
  >([]);
  const [partDraft, setPartDraft] = useState({
    designation: "",
    reference: "",
    quantity: "",
    link: "",
    price: "",
    boughtByClient: false,
  });
  const [beforePhotos, setBeforePhotos] = useState<File[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<File[]>([]);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function startLiveIntervention() {
    setStartingLive(true);
    const res = await fetch(`/api/admin/vehicles/${vehicle.id}/start-live`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      router.push(`/admin/interventions/${data.interventionId}/live`);
    } else {
      setStartingLive(false);
    }
  }

  function addPartToQueue() {
    if (!partDraft.designation) return;
    setQueuedParts((q) => [...q, partDraft]);
    setPartDraft({ designation: "", reference: "", quantity: "", link: "", price: "", boughtByClient: false });
  }

  function removeQueuedPart(idx: number) {
    setQueuedParts((q) => q.filter((_, i) => i !== idx));
  }

  const timerKey = `cam_timer_${vehicle.id}`;
  const [timerStart, setTimerStart] = useState<number | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(timerKey);
    if (saved) setTimerStart(Number(saved));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timerStart == null) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerStart]);

  function startTimer() {
    const now = Date.now();
    localStorage.setItem(timerKey, String(now));
    setTimerStart(now);
  }

  function stopTimer() {
    if (timerStart == null) return;
    const hours = (Date.now() - timerStart) / 3_600_000;
    setHoursSpent(hours.toFixed(2));
    setPrice((hours * hourlyRate).toFixed(2));
    if (!date) setDate(new Date().toISOString().slice(0, 10));
    localStorage.removeItem(timerKey);
    setTimerStart(null);
    setShowForm(true);
  }

  function formatElapsed(ms: number) {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }

  function calculatePrice() {
    const hours = Number(hoursSpent);
    if (hours > 0) setPrice((hours * hourlyRate).toFixed(2));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicle.id}/interventions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          endDate: endDate || null,
          description,
          price: price ? Number(price) : null,
          mileage: mileage ? Number(mileage) : null,
          hoursSpent: hoursSpent ? Number(hoursSpent) : null,
          maintenanceTypeId: maintenanceTypeId || null,
          notes: notes || null,
          vehicleCondition: vehicleCondition || null,
        }),
      });
      const data = await res.json();
      const interventionId = data.intervention?.id as string | undefined;

      if (interventionId) {
        for (const p of queuedParts) {
          await fetch(`/api/admin/interventions/${interventionId}/parts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              designation: p.designation,
              reference: p.reference || null,
              quantity: p.quantity || null,
              link: p.link || null,
              price: p.price ? Number(p.price) : null,
              boughtByClient: p.boughtByClient,
            }),
          });
        }
        for (const file of beforePhotos) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("category", "before");
          await fetch(`/api/admin/interventions/${interventionId}/photos`, { method: "POST", body: fd });
        }
        for (const file of afterPhotos) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("category", "after");
          await fetch(`/api/admin/interventions/${interventionId}/photos`, { method: "POST", body: fd });
        }
        if (todoText) {
          await fetch(`/api/admin/vehicles/${vehicle.id}/planned-repairs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: todoText, priority: todoPriority }),
          });
        }
      }
    } finally {
      setSubmitting(false);
    }

    setDate("");
    setEndDate("");
    setDescription("");
    setPrice("");
    setMileage("");
    setHoursSpent("");
    setMaintenanceTypeId("");
    setNotes("");
    setVehicleCondition("");
    setTodoText("");
    setTodoPriority("normal");
    setQueuedParts([]);
    setBeforePhotos([]);
    setAfterPhotos([]);
    setShowForm(false);
    onChanged();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2">
        <h3 className="text-sm font-medium text-gray-300">Historique des interventions</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={startLiveIntervention}
            disabled={startingLive}
            className="text-xs text-green-400 hover:text-green-300 cursor-pointer disabled:opacity-50"
          >
            {startingLive ? "..." : "▶ Démarrer en direct"}
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            {showForm ? "Annuler" : "+ Ajouter"}
          </button>
        </div>
      </div>

      <div className="mb-3">
        {timerStart == null ? (
          <button
            onClick={startTimer}
            className="text-xs px-2 py-1 rounded-lg border border-gray-700 text-gray-400 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
          >
            ⏱ Démarrer le chrono
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400">
              ⏱ {formatElapsed(Date.now() - timerStart)} (depuis{" "}
              {new Date(timerStart).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })})
            </span>
            <button
              onClick={stopTimer}
              className="px-2 py-1 rounded-lg bg-amber-500 text-gray-900 font-semibold cursor-pointer"
            >
              Arrêter
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="space-y-4 mb-3 bg-gray-800/30 border border-gray-700 rounded-lg p-3">
          {/* 1. Quand / kilométrage */}
          <div className="grid sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Date</label>
              <input
                type="date"
                required
                className={inputClass}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">
                Jusqu&apos;au (si plusieurs jours)
              </label>
              <input
                type="date"
                className={inputClass}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Kilométrage</label>
              <input
                type="number"
                placeholder="ex: 145000"
                className={inputClass}
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>
            <select
              className={inputClass}
              value={maintenanceTypeId}
              onChange={(e) => setMaintenanceTypeId(e.target.value)}
            >
              <option value="">Type d&apos;entretien lié (optionnel)</option>
              {maintenanceTypes
                .filter((t) => t.isActive)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
            </select>
          </div>

          {/* 2. Ce qui a été fait */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Ce qui a été fait</label>
            <input
              type="text"
              placeholder="Description de l'intervention"
              required
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 3. Ce qui faudra faire */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Ce qui faudra faire (optionnel)</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="ex: Prévoir plaquettes avant à la prochaine visite"
                className={inputClass}
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
              />
              <select
                className="px-2 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white"
                value={todoPriority}
                onChange={(e) => setTodoPriority(e.target.value as "normal" | "urgent")}
              >
                <option value="normal">Normal</option>
                <option value="urgent">⚠ Urgent</option>
              </select>
            </div>
          </div>

          {/* 4. Pièces utilisées */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Pièces utilisées</label>
            {queuedParts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {queuedParts.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-gray-700 bg-gray-800/50 text-gray-300"
                  >
                    {p.designation}
                    {p.quantity ? ` (${p.quantity})` : ""}
                    {p.price ? ` — ${p.price}€` : ""}
                    {p.link && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir le lien produit"
                        className="text-amber-400 hover:text-amber-300"
                      >
                        🔗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeQueuedPart(idx)}
                      className="text-gray-600 hover:text-red-400 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="grid sm:grid-cols-4 gap-1.5">
              <input
                placeholder="Pièce / huile (ex: Huile 5w30)"
                className={`${inputClass} sm:col-span-2`}
                value={partDraft.designation}
                onChange={(e) => setPartDraft((p) => ({ ...p, designation: e.target.value }))}
              />
              <div className="flex gap-1">
                <input
                  placeholder="Référence"
                  className={inputClass}
                  value={partDraft.reference}
                  onChange={(e) => setPartDraft((p) => ({ ...p, reference: e.target.value }))}
                />
                <a
                  href={`https://www.auto-doc.fr/search?keyword=${encodeURIComponent(
                    partDraft.reference || partDraft.designation
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chercher sur Autodoc"
                  className="flex-shrink-0 px-2 flex items-center rounded-lg border border-gray-700 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400"
                >
                  🔍
                </a>
              </div>
              <input
                placeholder="Quantité"
                className={inputClass}
                value={partDraft.quantity}
                onChange={(e) => setPartDraft((p) => ({ ...p, quantity: e.target.value }))}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Prix €"
                className={inputClass}
                value={partDraft.price}
                onChange={(e) => setPartDraft((p) => ({ ...p, price: e.target.value }))}
              />
              <input
                placeholder="Lien produit (coller l'URL Autodoc trouvée)"
                className={`${inputClass} sm:col-span-3`}
                value={partDraft.link}
                onChange={(e) => setPartDraft((p) => ({ ...p, link: e.target.value }))}
              />
              <button
                type="button"
                onClick={addPartToQueue}
                className="px-2 py-2 rounded-lg border border-gray-600 text-xs text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
              >
                + Ajouter
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <input
                type="checkbox"
                checked={partDraft.boughtByClient}
                onChange={(e) => setPartDraft((p) => ({ ...p, boughtByClient: e.target.checked }))}
              />
              La prochaine pièce ajoutée est achetée directement par le client
            </label>
          </div>

          {/* 5. Outillage / notes */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              Outillage spécifique / notes pour la prochaine fois
            </label>
            <textarea
              rows={2}
              placeholder="ex: douille 12 pans nécessaire, accès difficile..."
              className={inputClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* 6. Annexe : état du véhicule */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              Annexe — état constaté (plaquettes %, pneus, etc.)
            </label>
            <textarea
              rows={2}
              placeholder="ex: Plaquettes avant ~50%, pneu AV droit usé, triangle visible"
              className={inputClass}
              value={vehicleCondition}
              onChange={(e) => setVehicleCondition(e.target.value)}
            />
          </div>

          {/* 7. Temps & prix */}
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Temps passé (h)</label>
              <input
                type="number"
                step="0.25"
                placeholder="ex: 2.5"
                className={inputClass}
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
              />
            </div>
            {!isPersonal && (
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Prix €</label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="Prix €"
                    className={inputClass}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={calculatePrice}
                    disabled={!hoursSpent}
                    title={`Calculer : heures × ${hourlyRate}€/h`}
                    className="px-2 rounded-lg border border-gray-600 text-xs text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Calc.
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 8. Photos avant / après */}
          <div className="grid sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Photos avant (sécurité)</label>
              <button
                type="button"
                onClick={() => beforeInputRef.current?.click()}
                className="w-full px-2 py-2 rounded-lg border border-gray-700 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
              >
                📷 Ajouter ({beforePhotos.length})
              </button>
              <input
                ref={beforeInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => setBeforePhotos((p) => [...p, ...Array.from(e.target.files || [])])}
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Photos après (sécurité)</label>
              <button
                type="button"
                onClick={() => afterInputRef.current?.click()}
                className="w-full px-2 py-2 rounded-lg border border-gray-700 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
              >
                📷 Ajouter ({afterPhotos.length})
              </button>
              <input
                ref={afterInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => setAfterPhotos((p) => [...p, ...Array.from(e.target.files || [])])}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Enregistrement..." : "Ajouter l'intervention"}
          </button>
        </form>
      )}

      {vehicle.interventions.length === 0 ? (
        <p className="text-gray-500 text-sm">Aucune intervention enregistrée.</p>
      ) : (
        <ul className="space-y-3">
          {vehicle.interventions.map((i) =>
            i.status === "draft" ? (
              <li
                key={i.id}
                className="bg-blue-950/30 border border-dashed border-blue-700/50 rounded-lg px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-blue-300">
                    🔧 Intervention en cours — démarrée le {new Date(i.date).toLocaleDateString("fr-FR")}
                  </span>
                  <a
                    href={`/admin/interventions/${i.id}/live`}
                    className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer flex-shrink-0"
                  >
                    Reprendre
                  </a>
                </div>
                {!isPersonal && <PaymentsSection intervention={i} onChanged={onChanged} />}
              </li>
            ) : (
              <InterventionRow
                key={i.id}
                intervention={i}
                isPersonal={isPersonal}
                clientFirstName={clientFirstName}
                clientPhone={clientPhone}
                vehicleLabel={[vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "votre véhicule"}
                onChanged={onChanged}
              />
            )
          )}
        </ul>
      )}
    </div>
  );
}

function InterventionRow({
  intervention,
  isPersonal,
  clientFirstName,
  clientPhone,
  vehicleLabel,
  onChanged,
}: {
  intervention: Intervention;
  isPersonal: boolean;
  clientFirstName: string;
  clientPhone: string | null;
  vehicleLabel: string;
  onChanged: () => void;
}) {
  const [uploadingCategory, setUploadingCategory] = useState<"before" | "after" | "damage" | null>(null);
  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);
  const damageFileInputRef = useRef<HTMLInputElement>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(intervention.notes ?? "");
  const [toolLinkDraft, setToolLinkDraft] = useState(intervention.toolLink ?? "");
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState(intervention.price != null ? String(intervention.price) : "");
  const [normalPriceDraft, setNormalPriceDraft] = useState(
    intervention.normalPrice != null ? String(intervention.normalPrice) : ""
  );
  const [showPartForm, setShowPartForm] = useState(false);
  const [part, setPart] = useState({
    designation: "",
    reference: "",
    quantity: "",
    link: "",
    price: "",
    boughtByClient: false,
  });
  const [stockResults, setStockResults] = useState<{ id: string; name: string; reference: string | null; quantity: number }[]>(
    []
  );
  const [selectedStock, setSelectedStock] = useState<{ id: string; name: string; quantity: number } | null>(null);
  const [quantityUsed, setQuantityUsed] = useState("1");

  useEffect(() => {
    if (selectedStock || !part.designation.trim()) {
      setStockResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/admin/stock?q=${encodeURIComponent(part.designation)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setStockResults(d.parts.slice(0, 5));
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [part.designation, selectedStock]);

  function selectStockPart(sp: { id: string; name: string; reference: string | null; quantity: number }) {
    setPart((p) => ({ ...p, designation: sp.name, reference: sp.reference ?? p.reference }));
    setSelectedStock({ id: sp.id, name: sp.name, quantity: sp.quantity });
    setStockResults([]);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>, category: "before" | "after" | "damage") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCategory(category);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    await fetch(`/api/admin/interventions/${intervention.id}/photos`, {
      method: "POST",
      body: formData,
    });
    setUploadingCategory(null);
    e.target.value = "";
    onChanged();
  }

  async function removePhoto(url: string, category: "before" | "after" | "damage") {
    if (!confirm("Supprimer cette photo ?")) return;
    await fetch(`/api/admin/interventions/${intervention.id}/photos`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, category }),
    });
    onChanged();
  }

  async function deleteThisIntervention() {
    if (
      !confirm(
        `Supprimer définitivement cette intervention (${intervention.description || "sans description"}) ? Toutes ses photos, pièces et notes seront perdues.`
      )
    )
      return;
    await fetch(`/api/admin/interventions/${intervention.id}`, { method: "DELETE" });
    onChanged();
  }

  async function saveNotes() {
    await fetch(`/api/admin/interventions/${intervention.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notesDraft || null, toolLink: toolLinkDraft || null }),
    });
    setEditingNotes(false);
    onChanged();
  }

  async function savePrice() {
    await fetch(`/api/admin/interventions/${intervention.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: priceDraft ? Number(priceDraft) : null,
        normalPrice: normalPriceDraft ? Number(normalPriceDraft) : null,
      }),
    });
    setEditingPrice(false);
    onChanged();
  }

  async function handleAddPart(e: React.FormEvent) {
    e.preventDefault();
    if (!part.designation) return;
    await fetch(`/api/admin/interventions/${intervention.id}/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        designation: part.designation,
        reference: part.reference || null,
        quantity: part.quantity || null,
        link: part.link || null,
        price: part.price ? Number(part.price) : null,
        boughtByClient: part.boughtByClient,
        stockPartId: selectedStock?.id ?? null,
        quantityUsed: selectedStock && quantityUsed ? Number(quantityUsed) : null,
      }),
    });
    setPart({ designation: "", reference: "", quantity: "", link: "", price: "", boughtByClient: false });
    setSelectedStock(null);
    setStockResults([]);
    setQuantityUsed("1");
    setShowPartForm(false);
    onChanged();
  }

  async function removePart(id: string) {
    if (!confirm("Supprimer cette pièce ?")) return;
    await fetch(`/api/admin/parts/${id}`, { method: "DELETE" });
    onChanged();
  }

  const normalPriceNum = intervention.normalPrice != null ? Number(intervention.normalPrice) : null;
  const priceNum = intervention.price != null ? Number(intervention.price) : null;
  const discountPct =
    normalPriceNum != null && priceNum != null && normalPriceNum > priceNum
      ? Math.round((1 - priceNum / normalPriceNum) * 100)
      : null;
  const totalPaid = intervention.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = priceNum != null ? priceNum - totalPaid : null;

  return (
    <li className="text-sm text-gray-300 border-b border-gray-800 pb-3 last:border-0 last:pb-0">
      <div className="flex justify-between gap-2">
        <span>
          <span className="text-gray-500">
            {new Date(intervention.date).toLocaleDateString("fr-FR")}
            {intervention.endDate &&
              ` → ${new Date(intervention.endDate).toLocaleDateString("fr-FR")}`}
          </span>{" "}
          — {intervention.description}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isPersonal &&
            (editingPrice ? (
              <span className="flex items-center gap-1.5 flex-wrap justify-end">
                <span className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">Normal</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="—"
                    className="w-16 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                    value={normalPriceDraft}
                    onChange={(e) => setNormalPriceDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && savePrice()}
                  />
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500">Facturé</span>
                  <input
                    type="number"
                    step="0.01"
                    autoFocus
                    className="w-16 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                    value={priceDraft}
                    onChange={(e) => setPriceDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && savePrice()}
                  />
                </span>
                <button onClick={savePrice} className="text-green-400 hover:text-green-300 cursor-pointer text-xs" title="Enregistrer">
                  ✓
                </button>
                <button
                  onClick={() => {
                    setPriceDraft(intervention.price != null ? String(intervention.price) : "");
                    setNormalPriceDraft(intervention.normalPrice != null ? String(intervention.normalPrice) : "");
                    setEditingPrice(false);
                  }}
                  className="text-gray-500 hover:text-gray-300 cursor-pointer text-xs"
                  title="Annuler"
                >
                  ✕
                </button>
              </span>
            ) : (
              <button
                onClick={() => setEditingPrice(true)}
                className="text-right cursor-pointer"
                title="Modifier le prix normal / facturé (celui utilisé sur le récapitulatif)"
              >
                {priceNum != null ? (
                  <span className="text-amber-400">
                    {priceNum}€
                    {totalPaid > 0 && (
                      <span
                        className="ml-1"
                        title={
                          remaining != null && remaining > 0.005
                            ? `Payé ${totalPaid}€ — reste ${remaining.toFixed(2)}€`
                            : "Payé intégralement"
                        }
                      >
                        {remaining != null && remaining > 0.005 ? "🔶" : "✅"}
                      </span>
                    )}
                    {discountPct != null && (
                      <span className="text-gray-500 text-[10px] ml-1 block leading-tight">
                        normal {normalPriceNum}€ · -{discountPct}%
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-amber-400">+ prix</span>
                )}
              </button>
            ))}
          <button
            onClick={deleteThisIntervention}
            className="text-gray-600 hover:text-red-400 cursor-pointer"
            title="Supprimer cette intervention"
          >
            🗑
          </button>
        </div>
      </div>

      {(intervention.mileage != null || intervention.hoursSpent != null) && (
        <div className="text-xs text-gray-500 mt-1 flex gap-3">
          {intervention.mileage != null && <span>{intervention.mileage.toLocaleString("fr-FR")} km</span>}
          {intervention.hoursSpent != null && <span>{intervention.hoursSpent} h</span>}
        </div>
      )}

      {intervention.vehicleCondition && (
        <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">📋 {intervention.vehicleCondition}</div>
      )}

      {!isPersonal && <PaymentsSection intervention={intervention} onChanged={onChanged} />}

      {(
        [
          { label: "Avant", category: "before" as const, photos: intervention.photosBefore, ref: beforeFileInputRef },
          { label: "Après", category: "after" as const, photos: intervention.photosAfter, ref: afterFileInputRef },
          { label: "Dommage / pièce", category: "damage" as const, photos: intervention.photos, ref: damageFileInputRef },
        ]
      ).map((group) => (
        <div key={group.category} className="mt-2 flex items-start gap-2">
          <span className="text-[11px] text-gray-500 mt-1.5 w-16 flex-shrink-0">{group.label}</span>
          <div className="flex flex-wrap gap-2 items-center">
            {group.photos.map((url) => (
              <div key={url} className="relative group">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${group.label}`}
                    className="w-14 h-14 object-cover rounded border border-gray-700"
                  />
                </a>
                <button
                  onClick={() => removePhoto(url, group.category)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] leading-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => group.ref.current?.click()}
              disabled={uploadingCategory === group.category}
              className="text-xs text-gray-500 hover:text-amber-400 cursor-pointer disabled:opacity-50"
              title={`Ajouter une photo (${group.label})`}
            >
              {uploadingCategory === group.category ? "…" : "+ photo"}
            </button>
            <input
              ref={group.ref}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelected(e, group.category)}
            />
          </div>
        </div>
      ))}

      <div className="mt-2">
        {editingNotes ? (
          <div className="space-y-1">
            <textarea
              className={inputClass}
              rows={2}
              placeholder="Points clés, outils spéciaux à prévoir la prochaine fois..."
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
            />
            <div className="flex gap-1">
              <input
                className={inputClass}
                placeholder="Lien pour acheter l'outil spécial (si pas encore en ta possession)"
                value={toolLinkDraft}
                onChange={(e) => setToolLinkDraft(e.target.value)}
              />
              <a
                href={`https://www.auto-doc.fr/search?keyword=${encodeURIComponent(notesDraft)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Chercher un outil sur Autodoc"
                className="flex-shrink-0 px-2 flex items-center rounded-lg border border-gray-700 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400"
              >
                🔍
              </a>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveNotes}
                className="px-2 py-1 rounded bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setNotesDraft(intervention.notes ?? "");
                  setToolLinkDraft(intervention.toolLink ?? "");
                  setEditingNotes(false);
                }}
                className="px-2 py-1 rounded border border-gray-600 text-xs cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : intervention.notes || intervention.toolLink ? (
          <div className="flex items-start gap-1.5">
            <button
              onClick={() => setEditingNotes(true)}
              className="text-xs text-gray-400 hover:text-amber-400 cursor-pointer text-left whitespace-pre-wrap"
            >
              📝 {intervention.notes}
            </button>
            {intervention.toolLink && (
              <a
                href={intervention.toolLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Acheter l'outil spécial mentionné"
                className="flex-shrink-0 text-amber-400 hover:text-amber-300"
              >
                🔧🔗
              </a>
            )}
          </div>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            className="text-xs text-gray-600 hover:text-amber-400 cursor-pointer"
          >
            + Ajouter une note (points clés, outils...)
          </button>
        )}
      </div>

      <div className="mt-2">
        {intervention.partsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {intervention.partsUsed.map((p) => (
              <span
                key={p.id}
                className="group inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-gray-700 bg-gray-800/50 text-gray-300"
              >
                {p.stockPartId && (
                  <span title="Décompté du stock">📦</span>
                )}
                {p.designation}
                {p.quantity ? ` (${p.quantity})` : ""}
                {p.reference ? ` — réf. ${p.reference}` : ""}
                {p.price != null && ` — ${p.price}€`}
                {p.boughtByClient && (
                  <span className="text-[10px] text-gray-500" title="Achetée par le client">
                    (client)
                  </span>
                )}
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ouvrir le lien produit"
                    className="text-amber-400 hover:text-amber-300"
                  >
                    🔗
                  </a>
                )}
                {p.link && !isPersonal && clientPhone && (
                  <a
                    href={buildWhatsAppLink(
                      clientPhone,
                      buildPartsOrderMessage({
                        firstName: clientFirstName,
                        vehicleLabel,
                        parts: [{ designation: p.designation, link: p.link }],
                      })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Envoyer ce lien au client par WhatsApp pour qu'il commande la pièce"
                    className="text-green-400 hover:text-green-300"
                  >
                    📤
                  </a>
                )}
                <a
                  href={`/admin/parts-search?q=${encodeURIComponent(p.reference || p.designation)}`}
                  title="Rechercher cette pièce sur d'autres véhicules"
                  className="text-gray-500 hover:text-amber-400"
                >
                  🔍
                </a>
                <button
                  onClick={() => removePart(p.id)}
                  className="text-gray-600 hover:text-red-400 cursor-pointer"
                  title="Supprimer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {!isPersonal &&
          clientPhone &&
          intervention.partsUsed.filter((p) => p.link).length > 1 && (
            <a
              href={buildWhatsAppLink(
                clientPhone,
                buildPartsOrderMessage({
                  firstName: clientFirstName,
                  vehicleLabel,
                  parts: intervention.partsUsed
                    .filter((p): p is typeof p & { link: string } => !!p.link)
                    .map((p) => ({ designation: p.designation, link: p.link })),
                })
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mb-1 text-xs text-green-400 hover:text-green-300 cursor-pointer"
            >
              📤 Envoyer toutes les pièces au client par WhatsApp
            </a>
          )}
        {showPartForm ? (
          <form onSubmit={handleAddPart} className="grid sm:grid-cols-4 gap-1.5">
            <div className="sm:col-span-2 relative">
              <input
                placeholder="Pièce / huile (ex: Huile 5w30)"
                required
                className={inputClass}
                value={part.designation}
                onChange={(e) => {
                  setPart((p) => ({ ...p, designation: e.target.value }));
                  setSelectedStock(null);
                }}
              />
              {stockResults.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                  {stockResults.map((sp) => (
                    <li key={sp.id}>
                      <button
                        type="button"
                        onClick={() => selectStockPart(sp)}
                        className="w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-gray-800 cursor-pointer"
                      >
                        📦 {sp.name} {sp.reference ? `— réf. ${sp.reference}` : ""}{" "}
                        <span className="text-gray-500">(stock: {sp.quantity})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {selectedStock && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400">
                  <span>📦 lié au stock (dispo : {selectedStock.quantity})</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStock(null)}
                    className="text-gray-500 hover:text-gray-300 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            {selectedStock && (
              <input
                type="number"
                min={1}
                max={selectedStock.quantity}
                placeholder="Qté à décompter"
                className={inputClass}
                value={quantityUsed}
                onChange={(e) => setQuantityUsed(e.target.value)}
              />
            )}
            <div className="flex gap-1">
              <input
                placeholder="Référence"
                className={inputClass}
                value={part.reference}
                onChange={(e) => setPart((p) => ({ ...p, reference: e.target.value }))}
              />
              <a
                href={`https://www.auto-doc.fr/search?keyword=${encodeURIComponent(
                  part.reference || part.designation
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Chercher sur Autodoc"
                className="flex-shrink-0 px-2 flex items-center rounded-lg border border-gray-700 text-xs text-gray-400 hover:border-amber-500 hover:text-amber-400"
              >
                🔍
              </a>
            </div>
            <input
              placeholder="Quantité (ex: 4L)"
              className={inputClass}
              value={part.quantity}
              onChange={(e) => setPart((p) => ({ ...p, quantity: e.target.value }))}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prix €"
              className={inputClass}
              value={part.price}
              onChange={(e) => setPart((p) => ({ ...p, price: e.target.value }))}
            />
            <input
              placeholder="Lien produit (coller l'URL Autodoc trouvée)"
              className={`${inputClass} sm:col-span-3`}
              value={part.link}
              onChange={(e) => setPart((p) => ({ ...p, link: e.target.value }))}
            />
            <label className="sm:col-span-4 flex items-center gap-2 text-xs text-gray-400">
              <input
                type="checkbox"
                checked={part.boughtByClient}
                onChange={(e) => setPart((p) => ({ ...p, boughtByClient: e.target.checked }))}
              />
              Achetée directement par le client
            </label>
            <div className="sm:col-span-4 flex gap-2">
              <button
                type="submit"
                className="px-2 py-1 rounded bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPartForm(false);
                  setSelectedStock(null);
                  setStockResults([]);
                }}
                className="px-2 py-1 rounded border border-gray-600 text-xs cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowPartForm(true)}
            className="text-xs text-gray-600 hover:text-amber-400 cursor-pointer"
          >
            + Pièce / huile utilisée
          </button>
        )}
      </div>
    </li>
  );
}

function PaymentForm({ interventionId, onAdded }: { interventionId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  async function submit() {
    if (!amount) return;
    await fetch(`/api/admin/interventions/${interventionId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), method: method || null, date }),
    });
    setAmount("");
    setMethod("");
    setDate(new Date().toISOString().slice(0, 10));
    setOpen(false);
    onAdded();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-gray-600 hover:text-amber-400 cursor-pointer">
        + Encaisser un paiement
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input
        type="number"
        step="0.01"
        placeholder="Montant"
        autoFocus
        className="w-20 px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <select
        className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      >
        <option value="">—</option>
        <option value="cash">Espèces</option>
        <option value="card">Carte</option>
        <option value="transfer">Virement</option>
        <option value="check">Chèque</option>
      </select>
      <input
        type="date"
        className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-amber-500"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={submit} className="text-green-400 hover:text-green-300 cursor-pointer text-xs" title="Enregistrer">
        ✓
      </button>
      <button
        onClick={() => setOpen(false)}
        className="text-gray-500 hover:text-gray-300 cursor-pointer text-xs"
        title="Annuler"
      >
        ✕
      </button>
    </div>
  );
}

function PaymentsSection({ intervention, onChanged }: { intervention: Intervention; onChanged: () => void }) {
  async function removePaymentRow(id: string) {
    if (!confirm("Supprimer ce paiement ?")) return;
    await fetch(`/api/admin/payments/${id}`, { method: "DELETE" });
    onChanged();
  }

  const totalPaid = intervention.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const priceNum = intervention.price != null ? Number(intervention.price) : null;
  const remaining = priceNum != null ? priceNum - totalPaid : null;

  return (
    <div className="mt-2 text-xs">
      {intervention.payments.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {intervention.payments.map((p) => (
            <span
              key={p.id}
              className="group inline-flex items-center gap-1 px-2 py-0.5 rounded border border-gray-700 bg-gray-800/50 text-gray-300"
              title={p.method ? PAYMENT_METHOD_LABELS[p.method] ?? p.method : "Moyen de paiement non précisé"}
            >
              {p.method ? PAYMENT_METHOD_ICONS[p.method] ?? "💰" : "💰"} {Number(p.amount)}€
              <span className="text-gray-500">{new Date(p.date).toLocaleDateString("fr-FR")}</span>
              <button
                onClick={() => removePaymentRow(p.id)}
                className="text-gray-600 hover:text-red-400 cursor-pointer"
                title="Supprimer ce paiement"
              >
                ×
              </button>
            </span>
          ))}
          <span className="text-gray-500">
            Payé : {totalPaid}€
            {remaining != null && remaining > 0.005 && (
              <span className="text-amber-400"> · reste {remaining.toFixed(2)}€</span>
            )}
            {remaining != null && remaining <= 0.005 && <span className="text-green-400"> · payé intégralement</span>}
          </span>
        </div>
      )}

      <PaymentForm interventionId={intervention.id} onAdded={onChanged} />
    </div>
  );
}

function PlannedRepairsPanel({
  vehicle,
  clientFirstName,
  clientPhone,
  clientEmail,
  isPersonal,
  onChanged,
}: {
  vehicle: Vehicle;
  clientFirstName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  isPersonal: boolean;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [partsNote, setPartsNote] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [sendingQuoteId, setSendingQuoteId] = useState<string | null>(null);

  const vehicleLabel = [vehicle.make, vehicle.model, vehicle.plate].filter(Boolean).join(" ") || "votre véhicule";

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/vehicles/${vehicle.id}/planned-repairs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        targetDate: targetDate || null,
        priority,
        partsNote: partsNote || null,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : null,
      }),
    });
    setDescription("");
    setTargetDate("");
    setPriority("normal");
    setPartsNote("");
    setEstimatedPrice("");
    setShowForm(false);
    onChanged();
  }

  async function deleteRepair(repairId: string) {
    if (!confirm("Supprimer cette réparation à prévoir ?")) return;
    await fetch(`/api/admin/planned-repairs/${repairId}`, { method: "DELETE" });
    onChanged();
  }

  async function sendQuoteByEmail(repairId: string) {
    setSendingQuoteId(repairId);
    try {
      const res = await fetch(`/api/admin/planned-repairs/${repairId}/send-quote`, { method: "POST" });
      const data = await res.json();
      if (!data.success) alert(data.error ?? "Échec de l'envoi du devis.");
      else alert("Devis envoyé par email.");
    } finally {
      setSendingQuoteId(null);
    }
  }

  const sorted = [...vehicle.plannedRepairs].sort((a, b) =>
    a.priority === b.priority ? 0 : a.priority === "urgent" ? -1 : 1
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-300">Réparations à prévoir</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs text-amber-400 hover:text-amber-300 cursor-pointer"
        >
          {showForm ? "Annuler" : "+ Ajouter"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="grid sm:grid-cols-4 gap-2 mb-3">
          <input
            type="text"
            placeholder="Description"
            required
            className={`${inputClass} sm:col-span-2`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="date"
            className={inputClass}
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
          <select
            className="px-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value as "normal" | "urgent")}
          >
            <option value="normal">Normal</option>
            <option value="urgent">⚠ Urgent</option>
          </select>
          <input
            type="text"
            placeholder="Pièces / huile prévues (optionnel)"
            className={`${inputClass} sm:col-span-3`}
            value={partsNote}
            onChange={(e) => setPartsNote(e.target.value)}
          />
          {!isPersonal && (
            <input
              type="number"
              step="0.01"
              placeholder="Prix estimé €"
              className={inputClass}
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
          )}
          <button
            type="submit"
            className="sm:col-span-4 px-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold cursor-pointer"
          >
            Ajouter
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm">Rien de prévu.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((r) => (
            <li key={r.id} className="text-sm text-gray-300 border-b border-gray-800 pb-2 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <span>
                  {r.priority === "urgent" && (
                    <span className="text-red-400 font-semibold mr-1" title="Urgent">
                      ⚠
                    </span>
                  )}
                  {r.description}
                  {r.targetDate && (
                    <span className="text-gray-500">
                      {" "}
                      — prévu le {new Date(r.targetDate).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {!isPersonal && r.estimatedPrice != null && (
                    <span className="text-amber-400"> — {r.estimatedPrice}€ estimé</span>
                  )}
                </span>
                <div className="flex items-center gap-2 text-xs flex-shrink-0">
                  {!isPersonal && clientPhone && (
                    <a
                      href={buildWhatsAppLink(
                        clientPhone,
                        buildQuoteMessage({
                          firstName: clientFirstName,
                          vehicleLabel,
                          description: r.description,
                          partsNote: r.partsNote,
                          estimatedPrice: r.estimatedPrice,
                        })
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300 cursor-pointer"
                      title="Envoyer le devis par WhatsApp"
                    >
                      Devis WhatsApp
                    </a>
                  )}
                  {!isPersonal && clientEmail && (
                    <button
                      onClick={() => sendQuoteByEmail(r.id)}
                      disabled={sendingQuoteId === r.id}
                      className="text-blue-400 hover:text-blue-300 cursor-pointer disabled:opacity-50"
                      title="Envoyer le devis par email"
                    >
                      {sendingQuoteId === r.id ? "Envoi..." : "Devis email"}
                    </button>
                  )}
                  <button
                    onClick={() => deleteRepair(r.id)}
                    className="text-gray-600 hover:text-red-400 cursor-pointer"
                    title="Supprimer"
                  >
                    🗑
                  </button>
                </div>
              </div>
              {r.partsNote && <div className="text-xs text-gray-500 mt-0.5">🔧 {r.partsNote}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddVehicleForm({ clientId, onAdded }: { clientId: string; onAdded: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ make: "", model: "", plate: "", mileage: "" });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/admin/clients/${clientId}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        make: form.make || null,
        model: form.model || null,
        plate: form.plate || null,
        mileage: form.mileage ? Number(form.mileage) : null,
      }),
    });
    setForm({ make: "", model: "", plate: "", mileage: "" });
    setShowForm(false);
    onAdded();
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-amber-400 hover:text-amber-300 cursor-pointer"
      >
        + Ajouter un véhicule
      </button>
    );
  }

  return (
    <form onSubmit={handleAdd} className="grid sm:grid-cols-4 gap-2 border border-gray-700 rounded-xl p-4">
      <input
        placeholder="Marque"
        className={inputClass}
        value={form.make}
        onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
      />
      <input
        placeholder="Modèle"
        className={inputClass}
        value={form.model}
        onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
      />
      <input
        placeholder="Plaque"
        className={inputClass}
        value={form.plate}
        onChange={(e) => setForm((p) => ({ ...p, plate: e.target.value }))}
      />
      <input
        placeholder="Kilométrage"
        type="number"
        className={inputClass}
        value={form.mileage}
        onChange={(e) => setForm((p) => ({ ...p, mileage: e.target.value }))}
      />
      <div className="sm:col-span-4 flex gap-2">
        <button
          type="submit"
          className="px-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold cursor-pointer"
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-3 py-2 rounded-lg border border-gray-600 text-sm cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
