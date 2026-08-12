-- Ajoute la confirmation manuelle d'arrivée en banque pour les paiements par carte
-- (Stripe / terminal carte via Abby) : l'argent met environ 10 jours à arriver
-- réellement sur le compte, donc on ne le considère pas encaissé tant que ce
-- champ n'est pas renseigné (bouton "Confirmer reçu" dans l'agenda finance).
ALTER TABLE "Payment" ADD COLUMN "receivedConfirmedAt" TIMESTAMP(3);
