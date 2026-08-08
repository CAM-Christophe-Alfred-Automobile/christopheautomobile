import Link from "next/link";
import { getDailyIncomeForMonth } from "@/services/finance/transactions";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default async function FinanceAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getUTCFullYear();
  const month = params.month ? Number(params.month) : now.getUTCMonth() + 1;

  const { days, total } = await getDailyIncomeForMonth(year, month, "PRO");

  const firstDayOfMonth = new Date(Date.UTC(year, month - 1, 1));
  // getUTCDay() : 0 = dimanche → décale pour que la semaine commence lundi (0 = lundi).
  const firstWeekday = (firstDayOfMonth.getUTCDay() + 6) % 7;

  const cells: (typeof days[number] | null)[] = [...Array(firstWeekday).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const monthLabel = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(firstDayOfMonth);
  const isCurrentMonth = year === now.getUTCFullYear() && month === now.getUTCMonth() + 1;

  const linkClass =
    "px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:border-amber-500 hover:text-amber-400";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-semibold capitalize">{monthLabel}</h1>
        <div className="flex items-center gap-2">
          <Link href={`/admin/finance/agenda?year=${prevYear}&month=${prevMonth}`} className={linkClass}>
            ← Précédent
          </Link>
          {!isCurrentMonth && (
            <Link href="/admin/finance/agenda" className={linkClass}>
              Ce mois-ci
            </Link>
          )}
          <Link href={`/admin/finance/agenda?year=${nextYear}&month=${nextMonth}`} className={linkClass}>
            Suivant →
          </Link>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm text-gray-400">Total encaissé ce mois-ci (pro)</p>
        <p className="text-2xl font-semibold text-emerald-400">{formatEUR(total)}</p>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) =>
          cell ? (
            <div
              key={i}
              className={`rounded-lg border p-1.5 flex flex-col min-h-16 sm:min-h-20 ${
                cell.amount > 0 ? "border-emerald-700/40 bg-emerald-950/20" : "border-gray-800 bg-gray-900/50"
              }`}
            >
              <span className="text-[11px] text-gray-500">{cell.day}</span>
              {cell.amount > 0 && (
                <span className="mt-auto text-xs sm:text-sm font-medium text-emerald-400 truncate">
                  {formatEUR(cell.amount)}
                </span>
              )}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>
    </div>
  );
}
