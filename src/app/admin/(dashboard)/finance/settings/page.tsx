import { getSettings } from "@/services/finance/settings";
import { updateSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-semibold">Réglages</h1>
      <form action={updateSettingsAction} className="space-y-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Taux URSSAF à mettre de côté (%)</label>
          <input
            type="number"
            step="0.1"
            name="urssafRatePct"
            defaultValue={Number(settings.urssafRatePct)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Fréquence de paiement URSSAF</label>
          <select name="urssafFrequency" defaultValue={settings.urssafFrequency} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
            <option value="monthly">Mensuelle</option>
            <option value="quarterly">Trimestrielle</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Seuil d&apos;alerte Pro (€)</label>
            <input
              type="number"
              step="0.01"
              name="lowBalanceThresholdPro"
              defaultValue={Number(settings.lowBalanceThresholdPro)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Seuil d&apos;alerte Perso (€)</label>
            <input
              type="number"
              step="0.01"
              name="lowBalanceThresholdPerso"
              defaultValue={Number(settings.lowBalanceThresholdPerso)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Horizon de prévision (jours)</label>
          <input
            type="number"
            name="forecastHorizonDays"
            defaultValue={settings.forecastHorizonDays}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
          />
        </div>
        <div className="border-t border-gray-800 pt-4 space-y-3">
          <p className="text-sm text-gray-300">Objectif d&apos;épargne (optionnel)</p>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom de l&apos;objectif</label>
            <input
              type="text"
              name="savingsGoalLabel"
              defaultValue={settings.savingsGoalLabel ?? ""}
              placeholder="Ex: Fonds de sécurité"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Montant cible (€)</label>
            <input
              type="number"
              step="0.01"
              name="savingsGoalAmount"
              defaultValue={settings.savingsGoalAmount != null ? Number(settings.savingsGoalAmount) : ""}
              placeholder="Ex: 5000"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">Laisse vide pour masquer la barre de progression sur le dashboard.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Date cible (optionnel)</label>
            <input
              type="date"
              name="savingsGoalTargetDate"
              defaultValue={settings.savingsGoalTargetDate ? new Date(settings.savingsGoalTargetDate).toISOString().slice(0, 10) : ""}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Si renseignée, le dashboard calcule combien mettre de côté par mois pour l&apos;atteindre à temps.
            </p>
          </div>
        </div>
        <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium">
          Enregistrer
        </button>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-2">
        <h2 className="text-sm font-medium text-gray-300">Sauvegarde</h2>
        <p className="text-xs text-gray-500">
          Télécharge toutes tes données (comptes, transactions, catégories, récurrents, achats prévus) dans un fichier
          JSON, indépendamment de Vercel.
        </p>
        <a
          href="/api/admin/finance/backup"
          className="inline-block px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium border border-gray-700"
        >
          Télécharger une sauvegarde complète
        </a>
      </div>
    </div>
  );
}
