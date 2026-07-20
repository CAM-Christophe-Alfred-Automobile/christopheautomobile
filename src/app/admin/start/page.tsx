"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const inputClass =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white " +
  "placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors";

interface MatchedVehicle {
  id: string;
  make: string | null;
  model: string | null;
  plate: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function QuickStartPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    make: "",
    model: "",
    plate: "",
    mileage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [matchedVehicle, setMatchedVehicle] = useState<MatchedVehicle | null>(null);
  const [checkingPlate, setCheckingPlate] = useState(false);
  const [startingExisting, setStartingExisting] = useState(false);

  useEffect(() => {
    const plate = form.plate.trim();
    if (plate.length < 4) {
      setMatchedVehicle(null);
      return;
    }
    setCheckingPlate(true);
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/admin/vehicles/search?plate=${encodeURIComponent(plate)}`);
      const data = await res.json();
      setMatchedVehicle(data.success ? data.vehicle : null);
      setCheckingPlate(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [form.plate]);

  async function startExisting() {
    if (!matchedVehicle) return;
    setStartingExisting(true);
    const res = await fetch(`/api/admin/vehicles/${matchedVehicle.id}/start-live`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      router.push(`/admin/interventions/${data.interventionId}/live`);
    } else {
      setStartingExisting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/admin/interventions/${data.interventionId}/live`);
      } else {
        setSubmitting(false);
      }
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/CAM-blanc-complet.webp"
            alt="CAM"
            width={56}
            height={56}
            priority
            className="h-14 w-auto"
          />
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4"
        >
          <h1 className="text-lg font-semibold text-white text-center mb-2">Nouvelle intervention</h1>
          <p className="text-xs text-gray-500 text-center mb-4">
            Le strict nécessaire pour démarrer — tu complèteras le reste à la fin.
          </p>

          <div>
            <label className="block text-[11px] text-gray-500 mb-0.5">Plaque</label>
            <input
              type="text"
              placeholder="Commence par la plaque..."
              className={inputClass}
              value={form.plate}
              onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
            />
            {checkingPlate && <p className="text-[11px] text-gray-500 mt-1">Recherche...</p>}
          </div>

          {matchedVehicle ? (
            <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-3 space-y-2">
              <p className="text-sm text-blue-300">
                🔎 Véhicule déjà connu :{" "}
                <strong>
                  {matchedVehicle.client.firstName} {matchedVehicle.client.lastName}
                </strong>
                <br />
                {[matchedVehicle.make, matchedVehicle.model, matchedVehicle.plate].filter(Boolean).join(" ")}
              </p>
              <button
                type="button"
                onClick={startExisting}
                disabled={startingExisting}
                className="w-full py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold disabled:opacity-50"
              >
                {startingExisting ? "Démarrage..." : "▶ Continuer avec ce client"}
              </button>
              <p className="text-[11px] text-gray-500 text-center">
                Ce n&apos;est pas le bon véhicule ? Change la plaque ci-dessus.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Prénom du client</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Nom (optionnel)</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Marque</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.make}
                    onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Modèle</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 mb-0.5">Km</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.mileage}
                  onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold disabled:opacity-50"
              >
                {submitting ? "Démarrage..." : "▶ Démarrer"}
              </button>
            </>
          )}

          <Link href="/admin" className="block text-center text-xs text-gray-500 hover:text-gray-300">
            Annuler
          </Link>
        </form>
      </div>
    </main>
  );
}
