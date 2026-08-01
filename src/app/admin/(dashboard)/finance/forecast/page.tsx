import { computeForecast } from "@/services/finance/forecast";
import { getSettings } from "@/services/finance/settings";
import ForecastChart from "./ForecastChart";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ horizon?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();
  const horizon = params.horizon ? Number(params.horizon) : settings.forecastHorizonDays;
  const { points, firstShortfallDate } = await computeForecast(horizon);

  const last = points[points.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Prévisions de trésorerie</h1>
        <form className="flex gap-2 text-sm" method="get">
          <select name="horizon" defaultValue={horizon} className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5">
            <option value={30}>30 jours</option>
            <option value={60}>60 jours</option>
            <option value={90}>90 jours</option>
          </select>
          <button type="submit" className="px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800">
            Appliquer
          </button>
        </form>
      </div>

      {firstShortfallDate ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-300">
          ⚠️ Risque de découvert {firstShortfallDate.scope === "PRO" ? "sur le compte Pro" : "sur le compte Perso"}{" "}
          autour du{" "}
          <span className="font-medium">
            {new Intl.DateTimeFormat("fr-FR").format(new Date(firstShortfallDate.date))}
          </span>
          .
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-emerald-300">
          ✓ Aucun risque de découvert détecté sur les {horizon} prochains jours, selon vos seuils d&apos;alerte.
        </div>
      )}

      <ForecastChart points={points} />

      {last && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Pro dans {horizon}j</p>
            <p className={`text-xl font-semibold ${last.proBalance < 0 ? "text-red-400" : "text-blue-300"}`}>
              {formatEUR(last.proBalance)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Perso dans {horizon}j</p>
            <p className={`text-xl font-semibold ${last.persoBalance < 0 ? "text-red-400" : "text-purple-300"}`}>
              {formatEUR(last.persoBalance)}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Combiné dans {horizon}j</p>
            <p className={`text-xl font-semibold ${last.combinedBalance < 0 ? "text-red-400" : "text-gray-50"}`}>
              {formatEUR(last.combinedBalance)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
