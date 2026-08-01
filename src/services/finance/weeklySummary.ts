import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";
import { listAccounts, getAllCurrentBalances } from "@/services/finance/accounts";
import { listAdvice } from "@/services/finance/advice";
import { getSimpleSummary, getRevenueTarget } from "@/services/finance/coach";

const transporter = nodemailer.createTransport({
  host: siteConfig.smtp.host,
  port: siteConfig.smtp.port,
  auth: {
    user: siteConfig.smtp.user,
    pass: siteConfig.smtp.pass,
  },
});

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" });
}

const SEVERITY_COLOR: Record<string, string> = { critical: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };

/** Builds the weekly summary email HTML: balances, safe-to-spend, upcoming bills/income,
 * active advice, and the revenue target — same figures as the dashboard, mailed out so
 * Christophe doesn't have to open the app to get the weekly picture. */
export async function buildWeeklySummaryEmail(): Promise<{ subject: string; html: string }> {
  const [accounts, summary, advice, revenueTarget] = await Promise.all([
    listAccounts(),
    getSimpleSummary(),
    listAdvice(),
    getRevenueTarget(),
  ]);

  const balanceByAccountId = await getAllCurrentBalances(accounts);
  const accountBalances = accounts.map((a) => ({ name: a.name, balance: balanceByAccountId.get(a.id) ?? 0 }));
  const combined = accountBalances.reduce((sum, a) => sum + a.balance, 0);

  const accountRows = accountBalances
    .map((a) => `<tr><td style="padding:4px 12px 4px 0;">${a.name}</td><td style="padding:4px 0;text-align:right;font-weight:600;">${formatMoney(a.balance)}</td></tr>`)
    .join("");

  const upcomingRows = summary.upcomingItems
    .map((i) => `<tr><td style="padding:4px 12px 4px 0;">${i.label} <span style="color:#888;">(${formatDate(i.date)})</span></td><td style="padding:4px 0;text-align:right;color:#ef4444;">-${formatMoney(i.amount)}</td></tr>`)
    .join("");

  const incomeRows = summary.upcomingIncomeItems
    .map((i) => `<tr><td style="padding:4px 12px 4px 0;">${i.label} <span style="color:#888;">(${formatDate(i.date)})</span></td><td style="padding:4px 0;text-align:right;color:#10b981;">+${formatMoney(i.amount)}</td></tr>`)
    .join("");

  const adviceRows = advice
    .slice(0, 8)
    .map(
      (a) =>
        `<li style="margin-bottom:8px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${SEVERITY_COLOR[a.severity] ?? "#888"};margin-right:8px;"></span><strong>${a.title}</strong> — ${a.detail}</li>`
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: auto; color: #1a1a1a;">
      <h1 style="color: #10b981; font-size: 20px;">Résumé de la semaine — CAMfinance</h1>

      <h2 style="font-size: 16px; margin-top: 24px;">Solde total : ${formatMoney(combined)}</h2>
      <table style="width:100%; border-collapse: collapse; margin-top: 8px;">${accountRows}</table>

      <h2 style="font-size: 16px; margin-top: 24px;">Il te reste ${formatMoney(summary.safeToSpend)} librement</h2>
      <p style="color:#555; font-size: 14px;">Après les prélèvements et encaissements récurrents attendus dans les 30 prochains jours.</p>

      ${
        upcomingRows
          ? `<h3 style="font-size: 14px; margin-top: 20px;">Prélèvements à venir</h3><table style="width:100%; border-collapse: collapse;">${upcomingRows}</table>`
          : ""
      }
      ${
        incomeRows
          ? `<h3 style="font-size: 14px; margin-top: 20px;">Encaissements attendus</h3><table style="width:100%; border-collapse: collapse;">${incomeRows}</table>`
          : ""
      }

      <h3 style="font-size: 14px; margin-top: 20px;">Chiffre d'affaires cible ce mois-ci</h3>
      <p style="font-size: 20px; font-weight: 700; color: #10b981; margin: 4px 0;">${formatMoney(revenueTarget.monthlyRevenueTarget)}</p>

      ${
        adviceRows
          ? `<h3 style="font-size: 14px; margin-top: 20px;">À surveiller</h3><ul style="padding-left: 4px; list-style: none; font-size: 14px;">${adviceRows}</ul>`
          : ""
      }

      <p style="margin-top: 32px; font-size: 12px; color: #999;">Envoyé automatiquement chaque semaine par CAMfinance.</p>
    </div>
  `;

  return { subject: `CAMfinance — résumé de la semaine (${formatMoney(combined)})`, html };
}

export async function sendWeeklySummaryEmail(to: string): Promise<void> {
  const { subject, html } = await buildWeeklySummaryEmail();
  if (!siteConfig.smtp.host) {
    console.warn("⚠️ Configuration SMTP manquante. Résumé hebdomadaire non envoyé.");
    return;
  }
  await transporter.sendMail({ from: siteConfig.smtp.from, to, subject, html });
}
