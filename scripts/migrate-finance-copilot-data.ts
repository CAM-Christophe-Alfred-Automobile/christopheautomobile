/**
 * Migration ponctuelle des données de finance-copilot (base Postgres séparée
 * "financecopilot") vers la base de CAMadmin (base "neondb", nouveaux modèles
 * Account/Category/Transaction/... ajoutés à prisma/schema.prisma).
 *
 * Usage (PowerShell) :
 *   $env:OLD_FINANCE_DATABASE_URL = "<chaîne de connexion Postgres de financecopilot>"
 *   npx tsx scripts/migrate-finance-copilot-data.ts
 *
 * Conserve les id d'origine (préserve les relations, y compris
 * Transaction.linkedTransferId). Les champs Decimal passent tels quels de
 * findMany à create (pas de conversion Number(), qui ferait perdre en
 * précision sur des montants).
 */
import { PrismaClient } from "../src/generated/prisma";
import { prisma as newDb } from "../src/lib/prisma";

const OLD_DATABASE_URL = process.env.OLD_FINANCE_DATABASE_URL;
if (!OLD_DATABASE_URL) {
  throw new Error("Définis OLD_FINANCE_DATABASE_URL (chaîne de connexion de la base financecopilot) avant de lancer ce script.");
}

const oldDb = new PrismaClient({ datasourceUrl: OLD_DATABASE_URL });

async function migrateModel<T extends { id: string }>(
  name: string,
  fetchRows: () => Promise<T[]>,
  insertRow: (row: T) => Promise<unknown>
) {
  const rows = await fetchRows();
  let ok = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      await insertRow(row);
      ok++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${name} ${row.id}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`${name}: ${ok}/${rows.length} migrées${failed > 0 ? ` (${failed} en échec, voir ci-dessus)` : ""}`);
  return { total: rows.length, ok, failed };
}

async function main() {
  console.log("Migration des données finance-copilot -> CAMadmin\n");

  await migrateModel(
    "Account",
    () => oldDb.account.findMany(),
    (row) => newDb.account.create({ data: row })
  );

  await migrateModel(
    "Category",
    () => oldDb.category.findMany(),
    (row) => newDb.category.create({ data: row })
  );

  await migrateModel(
    "RecurringItem",
    () => oldDb.recurringItem.findMany(),
    (row) => newDb.recurringItem.create({ data: row })
  );

  await migrateModel(
    "ImportBatch",
    () => oldDb.importBatch.findMany(),
    (row) => newDb.importBatch.create({ data: row })
  );

  await migrateModel(
    "Transaction",
    () => oldDb.transaction.findMany(),
    (row) => newDb.transaction.create({ data: row })
  );

  await migrateModel(
    "BankConnection",
    () => oldDb.bankConnection.findMany(),
    (row) => newDb.bankConnection.create({ data: row })
  );

  await migrateModel(
    "Advice",
    () => oldDb.advice.findMany(),
    (row) => newDb.advice.create({ data: row })
  );

  await migrateModel(
    "PlannedPurchase",
    () => oldDb.plannedPurchase.findMany(),
    (row) => newDb.plannedPurchase.create({ data: row })
  );

  const oldSettings = await oldDb.appSettings.findMany();
  let settingsOk = 0;
  for (const s of oldSettings) {
    try {
      await newDb.financeSettings.create({
        data: {
          id: s.id,
          urssafRatePct: s.urssafRatePct,
          urssafFrequency: s.urssafFrequency,
          lowBalanceThresholdPro: s.lowBalanceThresholdPro,
          lowBalanceThresholdPerso: s.lowBalanceThresholdPerso,
          forecastHorizonDays: s.forecastHorizonDays,
          savingsGoalAmount: s.savingsGoalAmount,
          savingsGoalLabel: s.savingsGoalLabel,
          savingsGoalTargetDate: s.savingsGoalTargetDate,
          updatedAt: s.updatedAt,
        },
      });
      settingsOk++;
    } catch (err) {
      console.error(`  ✗ FinanceSettings ${s.id}:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`FinanceSettings: ${settingsOk}/${oldSettings.length} migrées (passwordHash volontairement non repris)`);

  console.log("\nVérification :");
  const accounts = await newDb.account.findMany();
  for (const acc of accounts) {
    const sum = await newDb.transaction.aggregate({
      where: { accountId: acc.id },
      _sum: { amount: true },
    });
    console.log(
      `  ${acc.name}: solde ancré ${acc.currentBalance}€ (au ${acc.balanceAsOf.toISOString().slice(0, 10)}) — somme des transactions liées : ${sum._sum.amount ?? 0}€`
    );
  }
}

main()
  .catch((err) => {
    console.error("Échec de la migration :", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  });
