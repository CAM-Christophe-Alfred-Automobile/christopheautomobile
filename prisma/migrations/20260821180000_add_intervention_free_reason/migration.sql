-- Justificatif quand une intervention est offerte/à prix réduit volontairement (échange de bon
-- procédé, petit cadeau...) — distingue une gratuité assumée d'un prix simplement oublié.
ALTER TABLE "Intervention" ADD COLUMN "freeReason" TEXT;
