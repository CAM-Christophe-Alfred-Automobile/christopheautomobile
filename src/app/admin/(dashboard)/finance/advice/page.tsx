import { recomputeAdvice, listAdvice } from "@/services/finance/advice";
import { dismissAdviceAction } from "./actions";

export const dynamic = "force-dynamic";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  info: "border-gray-700 bg-gray-900 text-gray-300",
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Urgent",
  warning: "À surveiller",
  info: "Info",
};

export default async function AdvicePage() {
  await recomputeAdvice();
  const advice = await listAdvice();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Conseils</h1>

      {advice.length === 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm text-emerald-300">
          ✓ Rien à signaler pour le moment.
        </div>
      )}

      <div className="space-y-3">
        {advice.map((item) => (
          <div key={item.id} className={`border rounded-xl p-4 ${SEVERITY_STYLES[item.severity]}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wide opacity-70">{SEVERITY_LABELS[item.severity]}</span>
                <h2 className="font-medium mt-0.5">{item.title}</h2>
                <p className="text-sm mt-1 opacity-90">{item.detail}</p>
              </div>
              <form action={dismissAdviceAction.bind(null, item.id)}>
                <button className="text-xs opacity-60 hover:opacity-100 whitespace-nowrap">Ignorer</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
