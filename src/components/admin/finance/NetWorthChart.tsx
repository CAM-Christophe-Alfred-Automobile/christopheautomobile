"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { NetWorthPoint } from "@/services/finance/accounts";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function NetWorthChart({ data }: { data: NetWorthPoint[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => formatEUR(v)} width={70} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            formatter={(value) => formatEUR(Number(value))}
          />
          <Line type="monotone" dataKey="total" name="Argent total" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
