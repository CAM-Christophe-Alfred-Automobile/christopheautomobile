import Link from "next/link";
import { getAnnualReport, listAvailableYears } from "@/services/finance/report";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const currentYear = new Date().getUTCFullYear();
  const year = params.year ? Number(params.year) : currentYear;

  const [report, years] = await Promise.all([getAnnualReport(year), listAvailableYears()]);
  const proCategories = report.categories.filter((c) => c.scope === "PRO");
  const persoCategories = report.categories.filter((c) => c.scope === "PERSO");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Bilan annuel</h1>
        <a
          href={`/api/admin/finance/transactions/export?from=${year}-01-01&to=${year}-12-31`}
          className="px-3 py-2 rounded-lg border border-gray-700 text-sm hover:bg-gray-800"
        >
          Exporter en CSV
        </a>
      </div>

      <div className="flex gap-2 text-sm">
        {years.map((y) => (
          <Link
            key={y}
            href={`/admin/finance/report?year=${y}`}
            className={`px-3 py-1.5 rounded-lg border ${y === year ? "border-emerald-600 bg-emerald-500/10 text-emerald-300" : "border-gray-700 hover:bg-gray-800"}`}
          >
            {y}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Pro — {year}</p>
          <p className="text-lg mt-1">
            <span className="text-emerald-400 font-semibold">{formatEUR(report.totalIncomePro)}</span>
            <span className="text-gray-500"> entrées</span>
          </p>
          <p className="text-lg">
            <span className="text-red-400 font-semibold">{formatEUR(report.totalExpensePro)}</span>
            <span className="text-gray-500"> dépenses</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Solde : <span className="font-medium text-gray-100">{formatEUR(report.totalIncomePro - report.totalExpensePro)}</span>
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400">Perso — {year}</p>
          <p className="text-lg mt-1">
            <span className="text-emerald-400 font-semibold">{formatEUR(report.totalIncomePerso)}</span>
            <span className="text-gray-500"> entrées</span>
          </p>
          <p className="text-lg">
            <span className="text-red-400 font-semibold">{formatEUR(report.totalExpensePerso)}</span>
            <span className="text-gray-500"> dépenses</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Solde : <span className="font-medium text-gray-100">{formatEUR(report.totalIncomePerso - report.totalExpensePerso)}</span>
          </p>
        </div>
      </div>

      {[
        { title: "Pro par catégorie", rows: proCategories },
        { title: "Perso par catégorie", rows: persoCategories },
      ].map(
        ({ title, rows }) =>
          rows.length > 0 && (
            <div key={title} className="space-y-2">
              <h2 className="text-sm font-medium text-gray-300">{title}</h2>
              <div className="border border-gray-800 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-900 text-gray-400 text-left">
                    <tr>
                      <th className="px-3 py-2">Catégorie</th>
                      <th className="px-3 py-2 text-right">Entrées</th>
                      <th className="px-3 py-2 text-right">Dépenses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {rows.map((c) => (
                      <tr key={`${c.categoryId}-${c.scope}`}>
                        <td className="px-3 py-2">{c.name}</td>
                        <td className="px-3 py-2 text-right text-emerald-400">{c.income > 0 ? formatEUR(c.income) : "—"}</td>
                        <td className="px-3 py-2 text-right text-red-400">{c.expense > 0 ? formatEUR(c.expense) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
      )}

      {report.categories.length === 0 && <p className="text-gray-500 text-sm">Aucune transaction pour {year}.</p>}
    </div>
  );
}
