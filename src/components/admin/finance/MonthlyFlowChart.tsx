"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import type { MonthlyFlow } from "@/services/finance/transactions";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    amount
  );
}

export default function MonthlyFlowChart({ data }: { data: MonthlyFlow[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="label" stroke="#71717a" fontSize={12} />
          <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => formatEUR(v)} width={70} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8 }}
            formatter={(value) => formatEUR(Number(value))}
          />
          <Legend />
          <Bar dataKey="proIncome" name="Entrées Pro" fill="#34d399" stackId="pro" />
          <Bar dataKey="proExpense" name="Dépenses Pro" fill="#f87171" stackId="pro-exp" />
          <Bar dataKey="persoIncome" name="Entrées Perso" fill="#a78bfa" stackId="perso" />
          <Bar dataKey="persoExpense" name="Dépenses Perso" fill="#fb923c" stackId="perso-exp" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
