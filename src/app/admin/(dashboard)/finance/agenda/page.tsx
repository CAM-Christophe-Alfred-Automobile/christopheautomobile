import Link from "next/link";
import { getDailyIncomeForMonth } from "@/services/finance/transactions";
import { getIncomeAgenda } from "@/services/finance/agenda";
import { ConfirmCardPaymentButton } from "@/components/admin/ConfirmCardPaymentButton";

export const dynamic = "force-dynamic";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

// Version compacte pour les cases du calendrier (peu de place) : pas de décimales
// quand le montant est rond, pour rester lisible sans zoomer sur téléphone.
function formatEURCompact(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
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

  // Rentrées futures connues sur le mois affiché : revenus récurrents actifs +
  // interventions réservées/en cours (prix facturé ou estimé), à partir d'aujourd'hui.
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const todayStr = now.toISOString().slice(0, 10);
  // Les paiements carte en attente de confirmation restent affichés même une fois leur date
  // d'arrivée attendue dépassée (c'est justement le cas à vérifier en priorité), contrairement
  // aux autres rentrées prévues qui ne montrent que ce qui reste à venir.
  const upcoming = (await getIncomeAgenda(monthStart, monthEnd)).filter(
    (e) => e.kind === "card-payment-pending" || e.date >= todayStr
  );
  const upcomingTotal = upcoming.reduce((sum, e) => sum + e.amount, 0);

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
              <span className="text-xs text-gray-400">{cell.day}</span>
              {cell.amount > 0 && (
                <span className="mt-auto text-[13px] sm:text-sm font-semibold text-emerald-400 truncate">
                  {formatEURCompact(cell.amount)}
                </span>
              )}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>

      {upcoming.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Rentrées prévues restant ce mois-ci</p>
            <p className="text-lg font-semibold text-emerald-400">{formatEUR(upcomingTotal)}</p>
          </div>
          <div className="divide-y divide-gray-800 text-sm">
            {upcoming.map((e, i) => {
              const label = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
                new Date(`${e.date}T12:00:00Z`)
              );
              const isPendingCard = e.kind === "card-payment-pending";
              const isOverdue = isPendingCard && e.date < todayStr;

              if (isPendingCard) {
                return (
                  <div key={i} className="flex items-center justify-between gap-3 py-2">
                    <span className={`truncate ${isOverdue ? "text-amber-400" : "text-gray-300"}`}>
                      {label} — {e.label}
                      <span className="text-amber-500">
                        {" "}
                        {isOverdue ? "(en retard, à vérifier)" : "(carte, en attente d'arrivée)"}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-amber-400 font-medium">{formatEUR(e.amount)}</span>
                      {e.paymentId && <ConfirmCardPaymentButton paymentId={e.paymentId} />}
                    </span>
                  </div>
                );
              }

              const row = (
                <div className="flex items-center justify-between gap-3 py-2">
                  <span className="text-gray-300 truncate">
                    {label} — {e.label}
                    {e.isEstimate && <span className="text-gray-500"> (estimation)</span>}
                  </span>
                  <span className="text-emerald-400 font-medium flex-shrink-0">{formatEUR(e.amount)}</span>
                </div>
              );
              return e.href ? (
                <Link key={i} href={e.href} className="block hover:bg-gray-800/50 -mx-1 px-1 rounded">
                  {row}
                </Link>
              ) : (
                <div key={i}>{row}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
