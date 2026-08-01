import { NextRequest, NextResponse } from "next/server";
import { listTransactions } from "@/services/finance/transactions";

function csvEscape(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const scope = searchParams.get("scope");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const transactions = await listTransactions({
    scope: scope === "PRO" || scope === "PERSO" ? scope : undefined,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const header = ["Date", "Description", "Compte", "Catégorie", "Scope", "Montant"];
  const lines = [header.join(";")];
  for (const tx of transactions) {
    lines.push(
      [
        new Intl.DateTimeFormat("fr-FR").format(new Date(tx.date)),
        csvEscape(tx.description),
        csvEscape(tx.account.name),
        csvEscape(tx.category?.name ?? ""),
        tx.scope,
        Number(tx.amount).toFixed(2).replace(".", ","),
      ].join(";")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions.csv"`,
    },
  });
}
