"use client";
import { useEffect, useState } from "react";
import type { ProBookingType } from "@/app/data/proSchedule";

type Step = "slot" | "form" | "confirm";

const TABS: { key: ProBookingType; label: string }[] = [
  { key: "urgence", label: "Urgence" },
  { key: "journee", label: "Journée complète (9h-17h30)" },
];

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ProBooking() {
  const [type, setType] = useState<ProBookingType>("urgence");
  const [step, setStep] = useState<Step>("slot");
  const [slotsData, setSlotsData] = useState<Record<string, { start: string }[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [adresse, setAdresse] = useState("");
  const [besoin, setBesoin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedStart, setConfirmedStart] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      setSlotsData(null);
      try {
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 90);
        const params = new URLSearchParams({
          type,
          start: start.toISOString().slice(0, 10),
          end: end.toISOString().slice(0, 10),
        });
        const res = await fetch(`/api/pro-availability?${params.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Erreur");
        setSlotsData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Impossible de charger les disponibilités.");
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [type]);

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pro-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          start: selectedSlot,
          nom,
          email,
          telephone,
          entreprise,
          adresse,
          besoin,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur lors de la réservation");
      setConfirmedStart(selectedSlot);
      setStep("confirm");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-5 sm:p-6">
      {step === "slot" && (
        <>
          <div className="flex justify-center gap-2 mb-5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setType(tab.key);
                  setSelectedSlot(null);
                }}
                className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  type === tab.key
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading && <p className="text-center text-gray-400">Recherche des créneaux...</p>}
          {error && <p className="text-center text-red-400 text-sm">{error}</p>}

          {slotsData && Object.keys(slotsData).length === 0 && !loading && (
            <p className="text-center text-gray-400">
              Aucun créneau disponible dans les prochains mois pour cette option. Contactez-moi
              directement pour trouver une solution.
            </p>
          )}

          {slotsData && Object.keys(slotsData).length > 0 && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {Object.entries(slotsData).map(([date, slots]) => (
                <div key={date}>
                  <p className="text-gray-300 font-medium mb-2 capitalize">{formatDateLabel(date)}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.start}
                        onClick={() => {
                          setSelectedSlot(s.start);
                          setStep("form");
                        }}
                        className="cursor-pointer px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-amber-600 text-sm text-gray-200 hover:text-white transition-colors"
                      >
                        {formatTimeLabel(s.start)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === "form" && selectedSlot && (
        <>
          <button
            onClick={() => setStep("slot")}
            className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
          >
            ← Changer de créneau
          </button>
          <p className="text-center text-amber-400 font-semibold mb-4">
            Créneau choisi : {formatDateLabel(selectedSlot.slice(0, 10))} à {formatTimeLabel(selectedSlot)}
          </p>
          <div className="grid gap-3">
            <input
              type="text"
              placeholder="Nom complet *"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Nom de l'entreprise / garage *"
              value={entreprise}
              onChange={(e) => setEntreprise(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <input
              type="tel"
              placeholder="Téléphone *"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Adresse de la mission *"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <textarea
              placeholder="Décrivez le besoin (tâches, compétences recherchées...) *"
              value={besoin}
              onChange={(e) => setBesoin(e.target.value)}
              rows={3}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting || !nom || !email || !telephone || !entreprise || !adresse || !besoin}
            className="cursor-pointer w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all py-3 rounded-lg font-bold text-white disabled:opacity-50"
          >
            {submitting ? "Réservation en cours..." : "Confirmer la réservation"}
          </button>
        </>
      )}

      {step === "confirm" && confirmedStart && (
        <div className="text-center">
          <p className="text-2xl mb-3">✅</p>
          <p className="text-amber-400 font-semibold text-lg mb-2">Réservation confirmée !</p>
          <p className="text-gray-300">
            Rendez-vous le {formatDateLabel(confirmedStart.slice(0, 10))} à{" "}
            {formatTimeLabel(confirmedStart)}. Vous allez recevoir un email de confirmation.
          </p>
        </div>
      )}
    </div>
  );
}
