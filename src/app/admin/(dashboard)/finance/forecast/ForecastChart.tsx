"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

type Point = {
  date: string;
  proBalance: number;
  persoBalance: number;
  combinedBalance: number;
  proBalanceLow: number;
  proBalanceHigh: number;
  persoBalanceLow: number;
  persoBalanceHigh: number;
};

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function ForecastChart({ points }: { points: Point[] }) {
  const data = points.map((p) => ({
    ...p,
    label: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(p.date)),
    proBand: [p.proBalanceLow, p.proBalanceHigh],
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="label" stroke="#71717a" fontSize={12} interval="preserveStartEnd" />
          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => formatEUR(v)} width={80} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            formatter={(value) => formatEUR(Number(value))}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="proBand"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.08}
            name="Fourchette Pro"
          />
          <Line type="monotone" dataKey="proBalance" stroke="#60a5fa" strokeWidth={2} dot={false} name="Pro" />
          <Line type="monotone" dataKey="persoBalance" stroke="#c084fc" strokeWidth={2} dot={false} name="Perso" />
          <Line
            type="monotone"
            dataKey="combinedBalance"
            stroke="#34d399"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={false}
            name="Combiné"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
