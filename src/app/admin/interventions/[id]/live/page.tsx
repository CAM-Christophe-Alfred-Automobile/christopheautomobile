"use client";

import { useCallback, useEffect, useRef, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { buildWhatsAppLink, buildStartWorkMessage, buildFinishWorkMessage } from "@/lib/whatsapp";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white " +
  "placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

interface MaintenanceType {
  id: string;
  label: string;
  isActive: boolean;
}

interface InterventionData {
  id: string;
  date: string;
  status: string;
  chronoStartedAt: string | null;
  hoursSpent: string | number | null;
  photosBefore: string[];
  photosAfter: string[];
  photos: string[];
  vehicleCondition: string | null;
  description: string;
  price: string | number | null;
  maintenanceTypeId: string | null;
  vehicle: {
    id: string;
    make: string | null;
    model: string | null;
    plate: string | null;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      phone: string | null;
      email: string | null;
      address: string | null;
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
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [hourlyRate, setHourlyRate] = useState(60);

  const [finalDescription, setFinalDescription] = useState("");
  const [finalMaintenanceTypeId, setFinalMaintenanceTypeId] = useState("");
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

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const damageInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/interventions/${id}`);
    const json = await res.json();
    if (json.success) setData(json.intervention);
    setLoading(false);
  }, [id]);

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
    await fetch(`/api/admin/interventions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chronoStartedAt: new Date().toISOString() }),
    });

    if (isFirstStart && data?.vehicle.client.phone) {
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
    await fetch(`/api/admin/interventions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hoursSpent: total, chronoStartedAt: null }),
    });
    return total;
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, category: "before" | "damage") {
    const file = e.target.files?.[0];
    if (!file) return;
    if (category === "before") setUploadingBefore(true);
    else setUploadingDamage(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    await fetch(`/api/admin/interventions/${id}/photos`, { method: "POST", body: fd });
    e.target.value = "";

    if (category === "before" && data && !data.chronoStartedAt) {
      await startChrono();
    } else {
      await load();
    }
    setUploadingBefore(false);
    setUploadingDamage(false);
  }

  async function addNote() {
    if (!noteText.trim() || !data) return;
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const line = `[${time}] ${noteText.trim()}`;
    const updated = data.vehicleCondition ? `${data.vehicleCondition}\n${line}` : line;
    await fetch(`/api/admin/interventions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleCondition: updated }),
    });
    setNoteText("");
    load();
  }

  async function handlePause() {
    await stopChronoAndAccumulate();
    if (data) router.push(`/admin/clients/${data.vehicle.client.id}`);
  }

  function openFinalize() {
    if (!data) return;
    setFinalDescription(data.description || "");
    setFinalMaintenanceTypeId(data.maintenanceTypeId || "");
    setFinalPrice((currentHoursSpent() * hourlyRate).toFixed(2));
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
    setFinalizing(true);

    const totalHours = await stopChronoAndAccumulate();

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

    await fetch(`/api/admin/interventions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: finalDescription,
        maintenanceTypeId: finalMaintenanceTypeId || null,
        price: finalPrice ? Number(finalPrice) : null,
        hoursSpent: totalHours,
        vehicleCondition: vehicleConditionUpdate,
        status: "done",
        ...(isMultiDay ? { endDate: new Date().toISOString() } : {}),
      }),
    });

    if (clientLastName || clientPhone || clientEmail || clientAddress) {
      await fetch(`/api/admin/clients/${data.vehicle.client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(clientLastName ? { lastName: clientLastName } : {}),
          ...(clientPhone ? { phone: clientPhone } : {}),
          ...(clientEmail ? { email: clientEmail } : {}),
          ...(clientAddress ? { address: clientAddress } : {}),
        }),
      });
    }

    const effectivePhone = clientPhone || data.vehicle.client.phone;
    if (effectivePhone) {
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

  return (
    <main className="min-h-screen bg-gray-900 text-white px-4 py-6 max-w-lg mx-auto space-y-5">
      <div>
        <p className="text-xs text-gray-500">Intervention en direct</p>
        <h1 className="text-xl font-semibold">{vehicleLabel}</h1>
        <p className="text-sm text-gray-400">{data.vehicle.client.firstName}</p>
      </div>

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

      {!showFinalize ? (
        <div className="grid grid-cols-1 gap-2 pt-2">
          <button
            onClick={openFinalize}
            className="w-full py-3 rounded-lg bg-amber-500 text-gray-900 font-semibold cursor-pointer"
          >
            ✅ Terminer l&apos;intervention
          </button>
          <button
            onClick={handlePause}
            className="w-full py-2.5 rounded-lg border border-gray-600 text-sm text-gray-300 cursor-pointer"
          >
            ⏸ Pas terminé — reprendre plus tard
          </button>
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
          <select
            className={inputClass}
            value={finalMaintenanceTypeId}
            onChange={(e) => setFinalMaintenanceTypeId(e.target.value)}
          >
            <option value="">Type d&apos;entretien lié (optionnel)</option>
            {maintenanceTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">
              Prix € (calculé : {currentHoursSpent().toFixed(2)}h × {hourlyRate}€/h)
            </label>
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
            />
          </div>

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
