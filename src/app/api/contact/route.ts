/**
 * API Route : POST /api/contact
 * 
 * Cette route API gère les soumissions du formulaire de contact.
 * Elle reçoit les données du formulaire, les valide, et envoie un email
 * au propriétaire du garage via le service Nodemailer.
 * 
 * FLUX DE FONCTIONNEMENT :
 * 1. Réception de la requête POST avec les données du formulaire (JSON)
 * 2. Extraction des champs : firstName, lastName, email, phone, subject, message
 * 3. Validation côté serveur (champs requis)
 * 4. Appel du service sendContactEmail() pour envoyer l'email
 * 5. Retour d'une réponse JSON (success: true/false)
 * 
 * RÉPONSES POSSIBLES :
 * - 200 OK : { success: true } - Email envoyé avec succès
 * - 400 Bad Request : { success: false, error: "..." } - Champs manquants
 * - 500 Internal Server Error : { success: false, error: "Erreur serveur" } - Problème d'envoi
 * 
 * CONFIGURATION REQUISE :
 * Variables d'environnement dans .env :
 * - SMTP_HOST : Serveur SMTP (ex: smtp.gmail.com)
 * - SMTP_PORT : Port SMTP (587 ou 465)
 * - SMTP_USER : Identifiant SMTP
 * - SMTP_PASS : Mot de passe SMTP (App Password pour Gmail)
 * - SMTP_FROM : Adresse expéditrice
 * - CONTACT_RECEIVER : Adresse destinataire
 */

import { NextResponse } from "next/server";
import { sendContactEmail } from "@/services/email";

/**
 * Handler POST pour le formulaire de contact
 * Next.js App Router détecte automatiquement cette fonction et la mappe sur /api/contact
 */
export async function POST(req: Request) {
  try {
    //! Extraction des données JSON du body de la requête
    const { firstName, lastName, email, phone, subject, message } = await req.json();

    //! Validation côté serveur des champs requis
    // Le téléphone est optionnel, mais tous les autres champs sont obligatoires
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Certains champs requis sont manquants." },
        { status: 400 } // Bad Request
      );
    }

    //! Envoi de l'email via le service Nodemailer
    // Cette fonction peut throw une erreur si l'envoi échoue
    await sendContactEmail({ firstName, lastName, email, phone, subject, message });

    //! Réponse de succès
    return NextResponse.json({ success: true });
    
  } catch (error) {
    //! Gestion des erreurs
    // Log de l'erreur pour le debugging
    console.error("Erreur API Contact:", error);
    
    // Retour d'une erreur générique au client (sans exposer les détails techniques)
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 } // Internal Server Error
    );
  }
}
