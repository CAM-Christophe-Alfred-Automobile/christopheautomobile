"use client";

import { useCallback, useEffect, useRef, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildWhatsAppLink, buildStartWorkMessage, buildFinishWorkMessage, buildDelayMessage } from "@/lib/whatsapp";
import { VEHICLE_TIERS, getVehicleTierMultiplier, type VehicleTier } from "@/app/data/vehicleTiers";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white " +
  "placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

interface MaintenanceType {
  id: string;
  label: string;
  isActive: boolean;
}

interface PartUsedData {
  id: string;
  designation: string;
  reference: string | null;
  quantity: string | null;
  price: string | number | null;
  boughtByClient: boolean;
}

interface InterventionData {
  id: string;
  date: string;
  status: string;
  chronoStartedAt: string | null;
  hoursSpent: string | number | null;
  estimatedHours: string | number | null;
  photosBefore: string[];
  photosAfter: string[];
  photos: string[];
  vehicleCondition: string | null;
  description: string;
  price: string | number | null;
  maintenanceTypeId: string | null;
  maintenanceTypeIds: string[];
  partsUsed: PartUsedData[];
  vehicle: {
    id: string;
    make: string | null;
    model: string | null;
    plate: string | null;
    mileage: number | null;
    tier: string | null;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      isPersonal: boolean;
    };
  };
}

export default function LiveInterventionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);
  const router = useRouter();
  const [data, setData] = useState<InterventionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingDamage, setUploadingDamage] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [partDesignation, setPartDesignation] = useState("");
  const [partPrice, setPartPrice] = useState("");
  const [partBoughtByClient, setPartBoughtByClient] = useState(false);
  const [addingPart, setAddingPart] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [hourlyRate, setHourlyRate] = useState(60);

  const [finalDescription, setFinalDescription] = useState("");
  const [finalMaintenanceTypeIds, setFinalMaintenanceTypeIds] = useState<string[]>([]);
  const [finalPrice, setFinalPrice] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [wearChecks, setWearChecks] = useState({
    plaquettes: "",
    pneus: "",
    disquesAvant: "",
    disquesArriere: "",
  });
  const [startWhatsAppUrl, setStartWhatsAppUrl] = useState<string | null>(null);
  const [finishWhatsAppUrl, setFinishWhatsAppUrl] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showInfoEdit, setShowInfoEdit] = useState(false);
  const [editPlate, setEditPlate] = useState("");
  const [editMileage, setEditMileage] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTier, setEditTier] = useState<VehicleTier>("standard");
  const [savingInfo, setSavingInfo] = useState(false);
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayDate, setDelayDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const damageInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/interventions/${id}`);
    const json = await res.json();
    if (json.success) setData(json.intervention);
    setLoading(false);
  }, [id]);

  // Vérifie une réponse fetch et lève une erreur explicite en cas d'échec réseau/serveur —
  // sans ça, un problème de connexion (fréquent chez un client, garage, sous-sol...) passait
  // inaperçu : l'écran affichait "enregistré" alors que rien n'avait été sauvegardé.
  async function patchIntervention(body: Record<string, unknown>): Promise<void> {
    const res = await fetch(`/api/admin/interventions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let json: { success?: boolean } = {};
    try {
      json = await res.json();
    } catch {
      // réponse non-JSON (ex: coupure réseau) — traité comme un échec ci-dessous
    }
    if (!res.ok || !json.success) {
      throw new Error("save-failed");
    }
  }

  useEffect(() => {
    load();
    fetch("/api/admin/maintenance-types")
      .then((r) => r.json())
      .then((d) => d.success && setMaintenanceTypes(d.types.filter((t: MaintenanceType) => t.isActive)));
    fetch("/api/admin/shop-settings")
      .then((r) => r.json())
      .then((d) => d.success && setHourlyRate(Number(d.settings.hourlyRate)));
  }, [load]);

  useEffect(() => {
    if (!data?.chronoStartedAt) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [data?.chronoStartedAt]);

  function formatElapsed(ms: number) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }

  function currentHoursSpent(): number {
    if (!data) return 0;
    const base = data.hoursSpent ? Number(data.hoursSpent) : 0;
    if (!data.chronoStartedAt) return base;
    const liveMs = Date.now() - new Date(data.chronoStartedAt).getTime();
    return base + liveMs / 3_600_000;
  }

  async function startChrono() {
    const isFirstStart = !data?.hoursSpent;
    try {
      await patchIntervention({ chronoStartedAt: new Date().toISOString() });
    } catch {
      alert(
        "⚠️ Le chrono n'a pas pu démarrer (connexion internet ?). Réessaie — l'intervention n'a pas été perdue, mais rien n'est encore enregistré."
      );
      return;
    }

    if (isFirstStart && data?.vehicle.client.phone && !data.vehicle.client.isPersonal) {
      const vehicleLabel =
        [data.vehicle.make, data.vehicle.model, data.vehicle.plate].filter(Boolean).join(" ") || "votre véhicule";
      setStartWhatsAppUrl(
        buildWhatsAppLink(
          data.vehicle.client.phone,
          buildStartWorkMessage({ firstName: data.vehicle.client.firstName, vehicleLabel })
        )
      );
    }
    load();
  }

  async function stopChronoAndAccumulate(): Promise<number> {
    if (!data) return 0;
    const total = currentHoursSpent();
    await patchIntervention({ hoursSpent: total, chronoStartedAt: null });
    return total;
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, category: "before" | "damage") {
    const file = e.target.files?.[0];
    if (!file) return;
    if (category === "before") setUploadingBefore(true);
    else setUploadingDamage(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", category);
      const res = await fetch(`/api/admin/interventions/${id}/photos`, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error("upload-failed");
      e.target.value = "";

      if (category === "before" && data && !data.chronoStartedAt) {
        await startChrono();
      } else {
        await load();
      }
    } catch {
      alert("⚠️ La photo n'a pas pu être envoyée (connexion internet ?). Réessaie dans quelques secondes.");
    } finally {
      setUploadingBefore(false);
      setUploadingDamage(false);
    }
  }

  async function addNote() {
    if (!noteText.trim() || !data) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const line = `[${time}] ${noteText.trim()}`;
    const updated = data.vehicleCondition ? `${data.vehicleCondition}\n${line}` : line;
    try {
      await patchIntervention({ vehicleCondition: updated });
    } catch {
      alert("⚠️ La note n'a pas pu être enregistrée (connexion internet ?). Réessaie.");
      return;
    }
    setNoteText("");
    load();
  }

  async function addPart() {
    if (!partDesignation.trim()) return;
    setAddingPart(true);
    try {
      const res = await fetch(`/api/admin/interventions/${id}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          designation: partDesignation.trim(),
          price: partPrice ? Number(partPrice) : null,
          boughtByClient: partBoughtByClient,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error("add-part-failed");
    } catch {
      alert("⚠️ La dépense n'a pas pu être enregistrée (connexion internet ?). Réessaie.");
      return;
    } finally {
      setAddingPart(false);
    }
    setPartDesignation("");
    setPartPrice("");
    setPartBoughtByClient(false);
    load();
  }

  async function removePart(partId: string) {
    if (!confirm("Supprimer cette dépense ?")) return;
    try {
      const res = await fetch(`/api/admin/parts/${partId}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error("remove-part-failed");
    } catch {
      alert("⚠️ La suppression a échoué (connexion internet ?). Réessaie.");
      return;
    }
    load();
  }

  /** Pièce finalement pas montée sur ce véhicule : la retire de l'intervention (elle ne
   * représente plus une dépense pour cette réparation) et la crée dans le stock, pour la
   * retrouver et la réutiliser plus tard. Si la pièce doit plutôt être renvoyée au
   * fournisseur, le bouton 🗑 suffit — pas besoin de passer par le stock. */
  async function movePartToStock(part: PartUsedData) {
    if (!data) return;
    if (!confirm(`Mettre "${part.designation}" en stock (elle ne sera plus comptée comme dépense de cette intervention) ?`)) {
      return;
    }
    const vehicleLbl = [data.vehicle.make, data.vehicle.model, data.vehicle.plate].filter(Boolean).join(" ") || "ce véhicule";
    const parsedQuantity = part.quantity ? parseInt(part.quantity, 10) : NaN;
    try {
      const stockRes = await fetch("/api/admin/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: part.designation,
          reference: part.reference || null,
          quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
          condition: "Neuf",
          notes: `Achetée pour ${vehicleLbl} le ${new Date(data.date).toLocaleDateString("fr-FR")}, finalement pas montée.`,
        }),
      });
      const stockJson = await stockRes.json().catch(() => ({}));
      if (!stockRes.ok || !stockJson.success) throw new Error("stock-create-failed");

      const removeRes = await fetch(`/api/admin/parts/${part.id}`, { method: "DELETE" });
      const removeJson = await removeRes.json().catch(() => ({}));
      if (!removeRes.ok || !removeJson.success) throw new Error("remove-part-failed");
    } catch {
      alert("⚠️ Échec de la mise en stock (connexion internet ?). Réessaie.");
      return;
    }
    load();
  }

  async function handlePause() {
    try {
      await stopChronoAndAccumulate();
    } catch {
      alert(
        "⚠️ La mise en pause n'a pas pu être enregistrée (connexion internet ?). L'intervention reste ouverte ici, réessaie."
      );
      return;
    }
    if (data) router.push(`/admin/clients/${data.vehicle.client.id}`);
  }

  function openInfoEdit() {
    if (!data) return;
    setEditPlate(data.vehicle.plate || "");
    setEditMileage(data.vehicle.mileage != null ? String(data.vehicle.mileage) : "");
    setEditPhone(data.vehicle.client.phone || "");
    setEditTier((data.vehicle.tier as VehicleTier) || "standard");
    setShowInfoEdit(true);
  }

  async function saveInfoEdit() {
    if (!data) return;
    setSavingInfo(true);
    try {
      const vehicleBody: Record<string, unknown> = {};
      if (editPlate !== (data.vehicle.plate || "")) vehicleBody.plate = editPlate || null;
      if (editMileage !== (data.vehicle.mileage != null ? String(data.vehicle.mileage) : "")) {
        vehicleBody.mileage = editMileage ? Number(editMileage) : null;
      }
      if (editTier !== ((data.vehicle.tier as VehicleTier) || "standard")) vehicleBody.tier = editTier;
      if (Object.keys(vehicleBody).length > 0) {
        const res = await fetch(`/api/admin/vehicles/${data.vehicle.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(vehicleBody),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error("vehicle-update-failed");
      }

      if (editPhone !== (data.vehicle.client.phone || "")) {
        const res = await fetch(`/api/admin/clients/${data.vehicle.client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: editPhone || null }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error("client-update-failed");
      }
    } catch {
      alert("⚠️ La mise à jour n'a pas pu être enregistrée (connexion internet ?). Réessaie.");
      setSavingInfo(false);
      return;
    }
    setSavingInfo(false);
    setShowInfoEdit(false);
    load();
  }

  function openFinalize() {
    if (!data) return;
    setFinalDescription(data.description || "");
    setFinalMaintenanceTypeIds(data.maintenanceTypeIds?.length ? data.maintenanceTypeIds : data.maintenanceTypeId ? [data.maintenanceTypeId] : []);
    const tierMultiplier = getVehicleTierMultiplier(data.vehicle.tier);
    setFinalPrice((currentHoursSpent() * hourlyRate * tierMultiplier).toFixed(2));
    setClientLastName(data.vehicle.client.lastName === "." ? "" : data.vehicle.client.lastName);
    setClientPhone(data.vehicle.client.phone || "");
    setClientEmail(data.vehicle.client.email || "");
    setClientAddress(data.vehicle.client.address || "");
    setWearChecks({ plaquettes: "", pneus: "", disquesAvant: "", disquesArriere: "" });
    setShowFinalize(true);
  }

  async function handleFinalize(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    if (!confirm("Es-tu sûr de vouloir terminer l'intervention ? Si ce n'est pas fini, utilise plutôt \"pas terminé — mettre en pause\".")) {
      return;
    }
    setFinalizing(true);

    let totalHours: number;
    try {
      totalHours = await stopChronoAndAccumulate();
    } catch {
      alert(
        "⚠️ Échec de l'enregistrement (connexion internet ?). Rien n'a été perdu — reste sur cette page et réessaie."
      );
      setFinalizing(false);
      return;
    }

    const isMultiDay = new Date(data.date).toDateString() !== new Date().toDateString();

    const wearLines = [
      wearChecks.plaquettes ? `Plaquettes de frein : ${wearChecks.plaquettes}%` : null,
      wearChecks.pneus ? `Pneus : ${wearChecks.pneus}%` : null,
      wearChecks.disquesAvant ? `Disques avant : ${wearChecks.disquesAvant}%` : null,
      wearChecks.disquesArriere ? `Disques/tambour arrière : ${wearChecks.disquesArriere}%` : null,
    ].filter((l): l is string => l != null);
    const vehicleConditionUpdate =
      wearLines.length > 0
        ? [data.vehicleCondition, wearLines.join("\n")].filter(Boolean).join("\n")
        : data.vehicleCondition;

    try {
      await patchIntervention({
        description: finalDescription,
        maintenanceTypeIds: finalMaintenanceTypeIds,
        price: !data.vehicle.client.isPersonal && finalPrice ? Number(finalPrice) : null,
        hoursSpent: totalHours,
        vehicleCondition: vehicleConditionUpdate,
        status: "done",
        completedAt: new Date().toISOString(),
        ...(isMultiDay ? { endDate: new Date().toISOString() } : {}),
      });
    } catch {
      alert(
        "⚠️ Échec de l'enregistrement final (connexion internet ?). Le temps travaillé est sauvegardé, mais l'intervention n'est PAS encore marquée terminée — reste sur cette page et réessaie."
      );
      setFinalizing(false);
      return;
    }

    if (clientLastName || clientPhone || clientEmail || clientAddress) {
      try {
        const res = await fetch(`/api/admin/clients/${data.vehicle.client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(clientLastName ? { lastName: clientLastName } : {}),
            ...(clientPhone ? { phone: clientPhone } : {}),
            ...(clientEmail ? { email: clientEmail } : {}),
            ...(clientAddress ? { address: clientAddress } : {}),
          }),
        });
        if (!res.ok) throw new Error("client-update-failed");
      } catch {
        alert(
          "⚠️ L'intervention est bien enregistrée, mais la mise à jour des coordonnées du client a échoué — à corriger sur sa fiche."
        );
      }
    }

    const effectivePhone = clientPhone || data.vehicle.client.phone;
    if (effectivePhone && !data.vehicle.client.isPersonal) {
      const vehicleLabel =
        [data.vehicle.make, data.vehicle.model, data.vehicle.plate].filter(Boolean).join(" ") || "votre véhicule";
      setFinishWhatsAppUrl(
        buildWhatsAppLink(
          effectivePhone,
          buildFinishWorkMessage({
            firstName: data.vehicle.client.firstName,
            vehicleLabel,
            description: finalDescription,
            price: finalPrice,
            anomalies: vehicleConditionUpdate,
            photos: [...data.photosBefore, ...data.photosAfter, ...data.photos],
          })
        )
      );
      setFinalizing(false);
      setDone(true);
    } else {
      router.push(`/admin/clients/${data.vehicle.client.id}`);
    }
  }

  if (loading) return <p className="text-gray-400 text-sm p-8">Chargement...</p>;
  if (!data) return <p className="text-gray-400 text-sm p-8">Intervention introuvable.</p>;

  if (done) {
    return (
      <main className="min-h-screen bg-gray-900 text-white px-4 py-8 max-w-sm mx-auto flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-3xl">✅</p>
        <h1 className="text-lg font-semibold">Intervention enregistrée</h1>
        {finishWhatsAppUrl && (
          <a
            href={finishWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold cursor-pointer"
          >
            📱 Envoyer le message de fin par WhatsApp
          </a>
        )}
        <button
          onClick={() => router.push(`/admin/clients/${data.vehicle.client.id}`)}
          className="w-full py-2.5 rounded-lg border border-gray-600 text-sm text-gray-300 cursor-pointer"
        >
          Retour à la fiche client
        </button>
      </main>
    );
  }

  const vehicleLabel = [data.vehicle.make, data.vehicle.model, data.vehicle.plate].filter(Boolean).join(" ") || "Véhicule";
  const notesLines = data.vehicleCondition ? data.vehicleCondition.split("\n") : [];
  const partsTotalCam = data.partsUsed
    .filter((p) => !p.boughtByClient)
    .reduce((sum, p) => sum + (p.price != null ? Number(p.price) : 0), 0);
  const partsTotalClient = data.partsUsed
    .filter((p) => p.boughtByClient)
    .reduce((sum, p) => sum + (p.price != null ? Number(p.price) : 0), 0);

  return (
    <main className="min-h-screen bg-gray-900 text-white px-4 py-6 max-w-lg mx-auto space-y-5">
      <Link
        href={`/admin/clients/${data.vehicle.client.id}`}
        className="text-sm text-gray-400 hover:text-amber-400 transition-colors cursor-pointer inline-block"
      >
        ← Retour à la fiche client
      </Link>
      <div>
        <p className="text-xs text-gray-500">Intervention en direct</p>
        <h1 className="text-xl font-semibold">{vehicleLabel}</h1>
        <p className="text-sm text-gray-400">{data.vehicle.client.firstName}</p>
      </div>

      {/* Plaque / km / téléphone — modifiables à tout moment */}
      {!showInfoEdit ? (
        <div className="flex items-center justify-between gap-2 bg-gray-800/30 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-400">
          <span>
            🚗 {data.vehicle.plate || "plaque ?"} · 📏{" "}
            {data.vehicle.mileage != null ? `${data.vehicle.mileage} km` : "km ?"} · 📱{" "}
            {data.vehicle.client.phone || "tél ?"} · 🚙{" "}
            {VEHICLE_TIERS.find((t) => t.key === data.vehicle.tier)?.label || "gabarit ?"}
          </span>
          <button
            type="button"
            onClick={openInfoEdit}
            className="text-amber-400 hover:text-amber-300 cursor-pointer flex-shrink-0"
          >
            Modifier
          </button>
        </div>
      ) : (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Plaque</label>
              <input
                type="text"
                className={inputClass}
                value={editPlate}
                onChange={(e) => setEditPlate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Kilométrage</label>
              <input
                type="number"
                className={inputClass}
                value={editMileage}
                onChange={(e) => setEditMileage(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Téléphone client</label>
            <input
              type="text"
              className={inputClass}
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              Gabarit du véhicule (comme sur le site — ajuste le prix main d&apos;œuvre)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VEHICLE_TIERS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setEditTier(t.key)}
                  title={t.examples}
                  className={`px-2.5 py-1 rounded-full border text-xs cursor-pointer ${
                    editTier === t.key
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-gray-700 text-gray-300 hover:border-amber-500 hover:text-amber-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={saveInfoEdit}
              disabled={savingInfo}
              className="flex-1 py-1.5 rounded-lg bg-amber-500 text-gray-900 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {savingInfo ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setShowInfoEdit(false)}
              className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-400 hover:text-gray-300 cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Chrono */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center">
        {data.chronoStartedAt ? (
          <>
            <p className="text-3xl font-mono text-amber-400">{formatElapsed(currentHoursSpent() * 3_600_000)}</p>
            <p className="text-xs text-gray-500 mt-1">
              Chrono en cours depuis{" "}
              {new Date(data.chronoStartedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-mono text-gray-400">{formatElapsed(currentHoursSpent() * 3_600_000)}</p>
            {data.hoursSpent ? (
              <p className="text-xs text-gray-500 mt-1">
                Chrono à l&apos;arrêt — temps réellement travaillé lors d&apos;une session précédente, pas du temps en
                cours.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Chrono pas encore démarré — repart de 0, jamais additionné à une estimation.
                {data.estimatedHours != null && ` (estimé à la réservation : ≈${data.estimatedHours}h, purement indicatif)`}
              </p>
            )}
            <button
              onClick={startChrono}
              className="mt-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold cursor-pointer"
            >
              ▶ {data.hoursSpent ? "Reprendre" : "Démarrer"} le chrono
            </button>
          </>
        )}
      </div>

      {startWhatsAppUrl && (
        <div className="flex items-center gap-2 bg-green-950/30 border border-green-700/50 rounded-lg p-2.5">
          <a
            href={startWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setStartWhatsAppUrl(null)}
            className="flex-1 text-sm text-green-400 hover:text-green-300 cursor-pointer text-center"
          >
            📱 Prévenir {data.vehicle.client.firstName} par WhatsApp que le travail commence
          </a>
          <button
            onClick={() => setStartWhatsAppUrl(null)}
            className="text-gray-500 hover:text-gray-300 cursor-pointer text-xs flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Photo avant */}
      <div>
        <h2 className="text-sm font-medium text-gray-300 mb-2">📷 Photo avant (sécurité)</h2>
        <div className="flex flex-wrap gap-2">
          {data.photosBefore.map((url) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={url} src={url} alt="Avant" className="w-16 h-16 object-cover rounded border border-gray-700" />
          ))}
          <button
            onClick={() => beforeInputRef.current?.click()}
            disabled={uploadingBefore}
            className="w-16 h-16 rounded border border-dashed border-gray-600 text-gray-500 hover:border-amber-500 hover:text-amber-400 cursor-pointer text-xs disabled:opacity-50"
          >
            {uploadingBefore ? "…" : "+ photo"}
          </button>
          <input
            ref={beforeInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e, "before")}
          />
        </div>
      </div>

      {/* Notes rapides */}
      <div>
        <h2 className="text-sm font-medium text-gray-300 mb-2">📝 Constats en direct (défauts, usure...)</h2>
        {notesLines.length > 0 && (
          <ul className="text-xs text-gray-400 space-y-1 mb-2 whitespace-pre-wrap">
            {notesLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ex: plaquettes avant ~40%, pneu AV usé..."
            className={inputClass}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addNote())}
          />
          <button
            onClick={addNote}
            className="px-3 py-2 rounded-lg border border-gray-600 text-sm text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer flex-shrink-0"
          >
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.photos.map((url) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={url} src={url} alt="Constat" className="w-14 h-14 object-cover rounded border border-gray-700" />
          ))}
          <button
            onClick={() => damageInputRef.current?.click()}
            disabled={uploadingDamage}
            className="w-14 h-14 rounded border border-dashed border-gray-600 text-gray-500 hover:border-amber-500 hover:text-amber-400 cursor-pointer text-xs disabled:opacity-50"
          >
            {uploadingDamage ? "…" : "+ photo"}
          </button>
          <input
            ref={damageInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e, "damage")}
          />
        </div>
      </div>

      {/* Pièces / dépenses — utilisable dès la réservation jusqu'à la clôture */}
      <div>
        <h2 className="text-sm font-medium text-gray-300 mb-2">💰 Pièces / dépenses</h2>
        {data.partsUsed.length > 0 && (
          <ul className="space-y-1.5 mb-2">
            {data.partsUsed.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 bg-gray-800/30 border border-gray-700 rounded-lg px-2.5 py-1.5 text-sm"
              >
                <span className="truncate">
                  {p.designation}
                  {p.boughtByClient && <span className="text-gray-500 text-xs"> (achetée par le client)</span>}
                </span>
                <span className="flex items-center gap-2 flex-shrink-0">
                  {p.price != null && <span className="text-amber-400 font-medium">{Number(p.price).toFixed(2)}€</span>}
                  <button
                    onClick={() => movePartToStock(p)}
                    className="text-gray-500 hover:text-blue-400 cursor-pointer text-xs"
                    title="Pas montée — mettre en stock pour plus tard"
                  >
                    → Stock
                  </button>
                  <button
                    onClick={() => removePart(p.id)}
                    className="text-gray-600 hover:text-red-400 cursor-pointer"
                    title="Supprimer (ex: pièce renvoyée au fournisseur)"
                  >
                    🗑
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        {partsTotalCam > 0 && (
          <p className="text-xs text-gray-400 mb-2">
            Total dépensé par CAM : <span className="text-amber-400 font-medium">{partsTotalCam.toFixed(2)}€</span>
            {partsTotalClient > 0 && ` (+ ${partsTotalClient.toFixed(2)}€ acheté par le client)`}
          </p>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Pièce, acompte fournisseur, autre..."
            className={`${inputClass} flex-1 min-w-[140px]`}
            value={partDesignation}
            onChange={(e) => setPartDesignation(e.target.value)}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="€"
            className={`${inputClass} w-24`}
            value={partPrice}
            onChange={(e) => setPartPrice(e.target.value)}
          />
          <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={partBoughtByClient}
              onChange={(e) => setPartBoughtByClient(e.target.checked)}
            />
            achetée par le client
          </label>
          <button
            onClick={addPart}
            disabled={addingPart || !partDesignation.trim()}
            className="px-3 py-2 rounded-lg bg-amber-500 text-gray-900 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            {addingPart ? "..." : "Ajouter"}
          </button>
        </div>
      </div>

      {!showFinalize ? (
        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            onClick={openFinalize}
            className="w-full py-3 rounded-lg bg-amber-500 text-gray-900 font-semibold cursor-pointer"
          >
            ✅ Terminer l&apos;intervention
          </button>
          {!showDelayForm ? (
            <button
              type="button"
              onClick={() => {
                if (data.vehicle.client.phone && !data.vehicle.client.isPersonal) {
                  setShowDelayForm(true);
                } else {
                  handlePause();
                }
              }}
              className="w-full py-2.5 rounded-lg border border-gray-600 text-sm text-gray-300 cursor-pointer"
            >
              ⏸ Problème / pas terminé — mettre en pause
            </button>
          ) : (
            <div className="rounded-lg border border-gray-600 p-2.5 space-y-2">
              <p className="text-xs text-gray-400">
                Un souci sur l&apos;intervention ? Préviens {data.vehicle.client.firstName} avant de mettre en pause :
              </p>
              <label className="block text-[11px] text-gray-400">
                Date proposée pour reprendre (vérifie ta dispo ce jour-là)
              </label>
              <div className="flex gap-1.5">
                {[5, 7].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + days);
                      setDelayDate(d.toISOString().slice(0, 10));
                    }}
                    className="px-2 py-1 rounded border border-gray-600 text-xs text-gray-300 hover:border-amber-500 hover:text-amber-400 cursor-pointer"
                  >
                    +{days}j
                  </button>
                ))}
                <input
                  type="date"
                  className={`${inputClass} flex-1`}
                  value={delayDate}
                  onChange={(e) => setDelayDate(e.target.value)}
                />
              </div>
              {data.vehicle.client.phone && (
                <div className="flex gap-1.5">
                  <a
                    href={buildWhatsAppLink(
                      data.vehicle.client.phone,
                      buildDelayMessage({
                        firstName: data.vehicle.client.firstName,
                        vehicleLabel,
                        proposedDate: delayDate,
                      })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setShowDelayForm(false);
                      handlePause();
                    }}
                    className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold text-center cursor-pointer"
                  >
                    📱 Envoyer le message et mettre en pause
                  </a>
                </div>
              )}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowDelayForm(false);
                    handlePause();
                  }}
                  className="flex-1 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-400 hover:text-gray-300 cursor-pointer"
                >
                  Mettre en pause sans message
                </button>
                <button
                  type="button"
                  onClick={() => setShowDelayForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-400 hover:text-gray-300 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleFinalize} className="space-y-3 border-t border-gray-700 pt-4">
          <h2 className="text-sm font-medium text-gray-300">Finaliser l&apos;intervention</h2>
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Ce qui a été fait</label>
            <input
              type="text"
              required
              className={inputClass}
              value={finalDescription}
              onChange={(e) => setFinalDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">
              Type(s) d&apos;entretien liés (optionnel — coche tout ce qui a été fait)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {maintenanceTypes.map((t) => (
                <label
                  key={t.id}
                  className={`px-2 py-1 rounded-lg border text-xs cursor-pointer ${
                    finalMaintenanceTypeIds.includes(t.id)
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={finalMaintenanceTypeIds.includes(t.id)}
                    onChange={() =>
                      setFinalMaintenanceTypeIds((ids) =>
                        ids.includes(t.id) ? ids.filter((id) => id !== t.id) : [...ids, t.id]
                      )
                    }
                    className="hidden"
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>
          {!data.vehicle.client.isPersonal && (
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">
                Main d&apos;œuvre € — hors pièces (calculé : {currentHoursSpent().toFixed(2)}h × {hourlyRate}€/h
                {getVehicleTierMultiplier(data.vehicle.tier) !== 1 &&
                  ` × ${getVehicleTierMultiplier(data.vehicle.tier).toFixed(2)} (gabarit ${
                    VEHICLE_TIERS.find((t) => t.key === data.vehicle.tier)?.label.toLowerCase()
                  })`}
                )
              </label>
              <input
                type="number"
                step="0.01"
                className={inputClass}
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
              />
              {partsTotalCam > 0 ? (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  + {partsTotalCam.toFixed(2)}€ de pièces/dépenses (enregistrées ci-dessus) ={" "}
                  <span className="text-amber-400 font-medium">
                    {((Number(finalPrice) || 0) + partsTotalCam).toFixed(2)}€ au total
                  </span>
                </p>
              ) : (
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Les pièces se gèrent dans la section « Pièces / dépenses » ci-dessus, ou ensuite sur la fiche du véhicule.
                </p>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-800">
            <p className="text-[11px] text-gray-500 mb-1.5">Contrôle usure (optionnel, en %)</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Plaquettes de frein</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="%"
                  className={inputClass}
                  value={wearChecks.plaquettes}
                  onChange={(e) => setWearChecks((w) => ({ ...w, plaquettes: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Pneus</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="%"
                  className={inputClass}
                  value={wearChecks.pneus}
                  onChange={(e) => setWearChecks((w) => ({ ...w, pneus: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Disques avant</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="%"
                  className={inputClass}
                  value={wearChecks.disquesAvant}
                  onChange={(e) => setWearChecks((w) => ({ ...w, disquesAvant: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Disques/tambour arrière</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="%"
                  className={inputClass}
                  value={wearChecks.disquesArriere}
                  onChange={(e) => setWearChecks((w) => ({ ...w, disquesArriere: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-800">
            <p className="text-[11px] text-gray-500 mb-1.5">Compléter les infos client (optionnel)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Nom"
                className={inputClass}
                value={clientLastName}
                onChange={(e) => setClientLastName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Téléphone"
                className={inputClass}
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className={`${inputClass} mt-2`}
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Adresse"
              className={`${inputClass} mt-2`}
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={finalizing}
            className="w-full py-3 rounded-lg bg-amber-500 text-gray-900 font-semibold cursor-pointer disabled:opacity-50"
          >
            {finalizing ? "Enregistrement..." : "Enregistrer l'intervention terminée"}
          </button>
          <button
            type="button"
            onClick={() => setShowFinalize(false)}
            className="w-full py-2 rounded-lg border border-gray-600 text-sm text-gray-300 cursor-pointer"
          >
            Retour
          </button>
        </form>
      )}
    </main>
  );
}
