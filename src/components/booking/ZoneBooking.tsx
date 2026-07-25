"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { marques, modelesParMarque } from "@/app/data/vehicleOptions";

const AUTRE = "__autre__";
const SEUIL_ANNEE_MOTORISATIONS_RECENTES = 2016;

interface ZoneBookingProps {
  dureeTotale: number;
  vehicleTierLabel?: string;
  vehicleTierKey?: string;
  estimatedPrice?: number;
  selectedServiceNames?: string[];
}

type Step = "address" | "slot" | "form" | "confirm";

interface AddressSuggestion {
  label: string;
  lat: number;
  lon: number;
}

interface ResolvedZoneInfo {
  zoneKey: string;
  zoneLabel: string;
  matchedAddress: string;
  distanceKm: number;
  outOfArea: boolean;
}

const TARIF_DEPLACEMENT_PAR_KM = 0.35; // aller simple depuis Salon-de-Provence

function computeTravelFee(distanceKm: number) {
  return Math.round(distanceKm * TARIF_DEPLACEMENT_PAR_KM * 100) / 100;
}

function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function formatTimeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ZoneBooking({
  dureeTotale,
  vehicleTierLabel,
  vehicleTierKey,
  estimatedPrice,
  selectedServiceNames,
}: ZoneBookingProps) {
  const [step, setStep] = useState<Step>("address");
  const [addressInput, setAddressInput] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [resolvedZone, setResolvedZone] = useState<ResolvedZoneInfo | null>(null);
  const [slotsData, setSlotsData] = useState<Record<string, { start: string }[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [commune, setCommune] = useState("");
  const [modele, setModele] = useState("");
  const [vMarque, setVMarque] = useState("");
  const [vModeleChoice, setVModeleChoice] = useState("");
  const [vModeleLibre, setVModeleLibre] = useState("");
  const [vAnnee, setVAnnee] = useState("");
  const [vMotorChoice, setVMotorChoice] = useState("");
  const [vMotorLibre, setVMotorLibre] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmedStart, setConfirmedStart] = useState<string | null>(null);

  const modelesDisponibles = useMemo(() => modelesParMarque[vMarque] ?? [], [vMarque]);
  // Les motorisations listées correspondent aux générations récentes (~2016+). Pour un véhicule plus
  // ancien, on ne propose pas de motorisation au hasard : bascule en saisie libre.
  const anneeAncienne = (() => {
    const annee = parseInt(vAnnee, 10);
    return !isNaN(annee) && annee < SEUIL_ANNEE_MOTORISATIONS_RECENTES;
  })();
  const motorisationsDisponibles = useMemo(
    () => (anneeAncienne ? [] : modelesDisponibles.find((m) => m.modele === vModeleChoice)?.motorisations ?? []),
    [modelesDisponibles, vModeleChoice, anneeAncienne]
  );
  const modeleFinal =
    modelesDisponibles.length === 0 || vModeleChoice === AUTRE ? vModeleLibre : vModeleChoice;
  const motorisationFinal =
    motorisationsDisponibles.length === 0 || vMotorChoice === AUTRE ? vMotorLibre : vMotorChoice;

  useEffect(() => {
    setModele(
      [vMarque, modeleFinal, motorisationFinal, vAnnee && `(${vAnnee})`].filter(Boolean).join(" ")
    );
  }, [vMarque, modeleFinal, motorisationFinal, vAnnee]);

  const fetchSlotsForZone = async (zoneKey: string) => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 90); // fenêtre de ~3 mois
    const params = new URLSearchParams({
      duree: String(dureeTotale),
      zone: zoneKey,
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    });
    const res = await fetch(`/api/cal-availability?${params.toString()}`);
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Erreur");
    return json.data as Record<string, { start: string }[]>;
  };

  const handleAddressChange = (value: string) => {
    setAddressInput(value);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      try {
        const res = await fetch(`/api/geocode-suggest?q=${encodeURIComponent(value)}`);
        const json = await res.json();
        setSuggestions(json.success ? json.suggestions : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestLoading(false);
      }
    }, 300);
  };

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    setAddressInput(suggestion.label);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/resolve-zone?lat=${suggestion.lat}&lon=${suggestion.lon}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur");

      // Si le client semble hors de notre secteur habituel, on ne le rattache pas
      // à un jour fixe : on lui propose les disponibilités générales.
      const zoneKey = json.outOfArea ? "salon-autre" : json.zoneKey;
      const zoneLabel = json.outOfArea ? "Salon-de-Provence / Autre secteur" : json.zoneLabel;

      const info: ResolvedZoneInfo = {
        zoneKey,
        zoneLabel,
        matchedAddress: suggestion.label,
        distanceKm: json.distanceKm,
        outOfArea: json.outOfArea,
      };
      setResolvedZone(info);
      setCommune(suggestion.label);

      const data = await fetchSlotsForZone(zoneKey);
      setSlotsData(data);
      setStep("slot");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de trouver votre secteur. Contactez-moi directement.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/cal-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duree: dureeTotale,
          start: selectedSlot,
          nom,
          email,
          telephone,
          commune,
          modele,
          immatriculation,
          description,
          distanceKm: resolvedZone?.distanceKm,
          vehicleTierLabel,
          vehicleTierKey,
          estimatedPrice,
          selectedServiceNames,
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
      {step === "address" && (
        <>
          <p className="text-center text-amber-400 font-semibold mb-4">
            Indiquez votre adresse pour voir les disponibilités de votre secteur
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex : 12 rue de la République, Salon-de-Provence"
              value={addressInput}
              onChange={(e) => handleAddressChange(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 disabled:opacity-50"
            />
            {suggestLoading && (
              <p className="text-gray-500 text-xs mt-1.5">Recherche d&apos;adresses...</p>
            )}
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => selectSuggestion(s)}
                    disabled={loading}
                    className="cursor-pointer w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-2">Sélectionnez votre adresse dans la liste proposée.</p>
          {loading && <p className="text-center text-gray-400 mt-3">Recherche des créneaux...</p>}
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        </>
      )}

      {step === "slot" && slotsData && resolvedZone && (
        <>
          <button
            onClick={() => setStep("address")}
            className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
          >
            ← Modifier mon adresse
          </button>
          <p className="text-center text-gray-300 text-sm mb-1">
            Secteur : <span className="text-amber-400 font-medium">{resolvedZone.zoneLabel}</span>
          </p>
          <p className="text-center text-gray-400 text-xs mb-1">
            Distance estimée : {resolvedZone.distanceKm} km • Frais de déplacement :{" "}
            <span className="text-gray-300 font-medium">{computeTravelFee(resolvedZone.distanceKm)} €</span>
          </p>
          {resolvedZone.outOfArea && (
            <p className="text-center text-gray-400 text-xs mb-4">
              Votre adresse semble un peu en dehors de mon secteur habituel (~{resolvedZone.distanceKm} km) —
              je confirmerai avec vous la faisabilité du déplacement.
            </p>
          )}
          <p className="text-center text-amber-400 font-semibold mb-4 mt-2">Choisissez un créneau</p>
          {Object.keys(slotsData).length === 0 ? (
            <p className="text-center text-gray-400">
              Aucun créneau disponible pour ce secteur dans les prochains mois. Contactez-moi directement
              pour trouver une solution.
            </p>
          ) : (
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
          <p className="text-center text-amber-400 font-semibold mb-1">
            Créneau choisi : {formatDateLabel(selectedSlot.slice(0, 10))} à {formatTimeLabel(selectedSlot)}
          </p>
          {resolvedZone && (
            <p className="text-center text-gray-400 text-xs mb-1">
              Frais de déplacement inclus : {computeTravelFee(resolvedZone.distanceKm)} € ({resolvedZone.distanceKm} km)
            </p>
          )}
          {vehicleTierLabel && estimatedPrice !== undefined && (
            <p className="text-center text-gray-400 text-xs mb-3">
              Véhicule : {vehicleTierLabel} • Main d&apos;œuvre estimée : {estimatedPrice} €
            </p>
          )}
          <div className="grid gap-3 mt-4">
            <input
              type="text"
              placeholder="Nom complet *"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
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
              placeholder="Téléphone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <input
              type="text"
              placeholder="Adresse de l'intervention *"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <select
              value={vMarque}
              onChange={(e) => {
                setVMarque(e.target.value);
                setVModeleChoice("");
                setVModeleLibre("");
                setVMotorChoice("");
                setVMotorLibre("");
              }}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
            >
              <option value="">Marque du véhicule *</option>
              {marques.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {modelesDisponibles.length > 0 ? (
              <select
                value={vModeleChoice}
                onChange={(e) => {
                  setVModeleChoice(e.target.value);
                  setVMotorChoice("");
                  setVMotorLibre("");
                }}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
              >
                <option value="">Modèle *</option>
                {modelesDisponibles.map((m) => (
                  <option key={m.modele} value={m.modele}>
                    {m.modele}
                  </option>
                ))}
                <option value={AUTRE}>Autre / je ne trouve pas mon modèle</option>
              </select>
            ) : (
              <input
                type="text"
                placeholder="Modèle du véhicule *"
                value={vModeleLibre}
                onChange={(e) => setVModeleLibre(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
              />
            )}

            {vModeleChoice === AUTRE && (
              <input
                type="text"
                placeholder="Précisez le modèle *"
                value={vModeleLibre}
                onChange={(e) => setVModeleLibre(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
              />
            )}

            <input
              type="text"
              placeholder="Année du véhicule (facultatif, ex: 2018)"
              value={vAnnee}
              onChange={(e) => setVAnnee(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />

            {motorisationsDisponibles.length > 0 ? (
              <select
                value={vMotorChoice}
                onChange={(e) => setVMotorChoice(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
              >
                <option value="">Motorisation (facultatif)</option>
                {motorisationsDisponibles.map((mot) => (
                  <option key={mot} value={mot}>
                    {mot}
                  </option>
                ))}
                <option value={AUTRE}>Autre / je ne sais pas</option>
              </select>
            ) : (
              modeleFinal && (
                <input
                  type="text"
                  placeholder="Motorisation (facultatif, ex: 1.5 BlueHDi 130)"
                  value={vMotorLibre}
                  onChange={(e) => setVMotorLibre(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
                />
              )
            )}

            {vMotorChoice === AUTRE && (
              <input
                type="text"
                placeholder="Précisez la motorisation (facultatif)"
                value={vMotorLibre}
                onChange={(e) => setVMotorLibre(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
              />
            )}
            <input
              type="text"
              placeholder="Plaque d'immatriculation *"
              value={immatriculation}
              onChange={(e) => setImmatriculation(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
            <textarea
              placeholder="Décrivez le souci rencontré *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
            />
          </div>
          {anneeAncienne && modeleFinal && (
            <p className="text-xs text-gray-400 mt-2">
              💡 Les motorisations proposées concernent surtout les véhicules récents. Pour un véhicule de{" "}
              {vAnnee}, précisez la motorisation vous-même si vous la connaissez.
            </p>
          )}
          {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !nom ||
              !email ||
              !commune ||
              !vMarque ||
              !modeleFinal ||
              !immatriculation ||
              !description
            }
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
