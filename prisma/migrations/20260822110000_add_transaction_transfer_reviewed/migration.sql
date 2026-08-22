-- Pour les grosses entrées synchronisées sur un compte bancaire : a-t-on déjà demandé si
-- c'était un virement espèces->banque ? Défaut true pour tout l'historique existant afin de
-- ne pas soudainement demander confirmation pour des centaines d'anciennes transactions —
-- seules les nouvelles transactions synchronisées à partir de maintenant seront concernées.
ALTER TABLE "Transaction" ADD COLUMN "transferReviewed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Transaction" ALTER COLUMN "transferReviewed" SET DEFAULT false;
