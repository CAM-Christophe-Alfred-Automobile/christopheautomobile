-- Coché manuellement une fois la facture faite (facturation par lot, différée) — alimente la
-- liste "Factures à faire" de l'accueil admin.
ALTER TABLE "Intervention" ADD COLUMN "invoicedAt" TIMESTAMP(3);
