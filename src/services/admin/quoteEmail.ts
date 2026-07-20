import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

const transporter = nodemailer.createTransport({
  host: siteConfig.smtp.host,
  port: siteConfig.smtp.port,
  auth: {
    user: siteConfig.smtp.user,
    pass: siteConfig.smtp.pass,
  },
});

export async function sendQuoteEmail({
  to,
  clientFirstName,
  vehicleLabel,
  description,
  partsNote,
  estimatedPrice,
}: {
  to: string;
  clientFirstName: string;
  vehicleLabel: string;
  description: string;
  partsNote?: string | null;
  estimatedPrice?: number | null;
}) {
  if (!siteConfig.smtp.host) {
    console.warn("⚠️ Configuration SMTP manquante. Devis non envoyé par email.");
    return;
  }

  await transporter.sendMail({
    from: siteConfig.smtp.from,
    to,
    subject: `Devis — ${vehicleLabel} | ${siteConfig.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background-color: white; padding: 20px; border-radius: 8px;">
          <h1 style="color: #BB4D00;">Devis — ${vehicleLabel}</h1>
          <p>Bonjour ${clientFirstName},</p>
          <p>Voici le devis pour l'intervention prévue sur votre véhicule <strong>${vehicleLabel}</strong> :</p>
          <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px; white-space: pre-wrap;">
            ${description}
          </div>
          ${
            partsNote
              ? `<h2 style="color: #555; font-size: 16px;">Pièces prévues</h2><p style="white-space: pre-wrap;">${partsNote}</p>`
              : ""
          }
          ${
            estimatedPrice != null
              ? `<h2 style="color: #555; font-size: 16px;">Prix estimé</h2><p><strong>${estimatedPrice} €</strong></p>`
              : ""
          }
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>N'hésitez pas à me contacter pour valider ou pour toute question.</p>
          <p>${siteConfig.name}${siteConfig.phone ? ` — ${siteConfig.phone}` : ""}</p>
        </div>
      </div>
    `,
  });
}
