// -----------------------------------------------------------------------------
// Fichier : src/services/email.ts
// -----------------------------------------------------------------------------
// 🎯 SERVICE D'ENVOI D'EMAILS (Formulaire de contact)
// Gère l'envoi d'emails depuis la page de contact à l'administrateur du site.
// Utilise Nodemailer + les variables centralisées dans src/config/site.ts
// -----------------------------------------------------------------------------

import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site"; // ✅ on charge la config centralisée

// -----------------------------------------------------------------------------
// ! CONFIGURATION SMTP
// -----------------------------------------------------------------------------

const smtpConfig = {
  host: siteConfig.smtp.host,
  port: siteConfig.smtp.port,
  auth: {
    user: siteConfig.smtp.user,
    pass: siteConfig.smtp.pass,
  },
};

// Création du transporteur SMTP
const transporter = nodemailer.createTransport(smtpConfig);

// -----------------------------------------------------------------------------
// ! FONCTION PRINCIPALE : ENVOYER UN EMAIL DE CONTACT
// -----------------------------------------------------------------------------

export async function sendContactEmail({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
  attachments,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  attachments?: { name: string; content: string }[];
}) {
  // ✅ Vérifie que les infos nécessaires sont présentes
  if (!siteConfig.smtp.host || !siteConfig.contact.receiver) {
    console.warn("⚠️ Configuration SMTP ou destinataire manquante. Email non envoyé.");
    console.log("📧 Simulation d'envoi d'email:", { firstName, lastName, email, subject, message });
    return;
  }

  try {
    const full_name = `${firstName} ${lastName}`;
    
    const mailAttachments = attachments?.map(file => ({
      filename: file.name,
      content: file.content,
      encoding: 'base64'
    })) || [];

    await transporter.sendMail({
      from: siteConfig.smtp.from, // ✅ Adresse d’envoi centralisée
      to: siteConfig.contact.receiver, // ✅ Destinataire du site
      replyTo: email,
      subject: `Contact (${siteConfig.name}) : ${subject}`, // ✅ inclut le nom du site
      attachments: mailAttachments,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h1 style="color: #BB4D00;">📩 Nouvelle demande d'information via le site web</h1>
            <p>Vous avez reçu un nouveau message de <strong>${full_name}</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <h2 style="color: #555;">Détails du contact</h2>
            <p><strong>Nom complet :</strong> ${full_name}</p>
            <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Téléphone :</strong> ${phone || 'Non fourni'}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <h2 style="color: #555;">Message</h2>
            <p><strong>Objet :</strong> ${subject}</p>
            <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px; white-space: pre-wrap; font-family: monospace;">
              ${message}
            </div>
          </div>
        </div>
      `,
    });

    console.log(`✅ Email de contact envoyé par ${full_name}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email de contact:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// ! ALERTE : réservation en attente de paiement (Cal.com)
// -----------------------------------------------------------------------------
// Un client a choisi un créneau et atteint l'étape de paiement de l'acompte,
// mais tant qu'il n'a pas payé, la réservation reste "pending" côté Cal.com et
// n'apparaît pas dans le CRM. Ce mail permet de le savoir tout de suite plutôt
// que de le découvrir par hasard en consultant Cal.com.

export async function sendPendingPaymentAlert({
  clientName,
  phone,
  email,
  date,
  description,
  address,
}: {
  clientName: string;
  phone?: string;
  email?: string;
  date: string; // déjà formatée, lisible
  description?: string;
  address?: string;
}) {
  if (!siteConfig.smtp.host || !siteConfig.contact.receiver) {
    console.warn("⚠️ Configuration SMTP ou destinataire manquante. Alerte paiement non envoyée.");
    return;
  }

  try {
    await transporter.sendMail({
      from: siteConfig.smtp.from,
      to: siteConfig.contact.receiver,
      subject: `⚠️ Réservation en attente de paiement — ${clientName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h1 style="color: #BB4D00;">⚠️ Réservation en attente de paiement</h1>
            <p><strong>${clientName}</strong> a choisi un créneau mais n'a pas encore payé l'acompte demandé. Tant que ce n'est pas réglé, ce rendez-vous ne sera ni confirmé, ni visible dans CAMadmin.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>Créneau :</strong> ${date}</p>
            ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ""}
            ${email ? `<p><strong>Email :</strong> ${email}</p>` : ""}
            ${address ? `<p><strong>Adresse :</strong> ${address}</p>` : ""}
            ${description ? `<p><strong>Description :</strong> ${description}</p>` : ""}
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #555;">Pensez à contacter le client si le paiement n'arrive pas, ou à refuser la réservation sur Cal.com pour libérer le créneau.</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ Alerte paiement en attente envoyée pour ${clientName}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'alerte paiement en attente:", error);
  }
}
