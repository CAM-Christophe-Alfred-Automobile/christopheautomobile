/**
 * ============================================================================
 * 📄 COMPOSANT : ContactForm
 * ============================================================================
 * Formulaire de contact avec validation et envoi d'email
 * 
 * 🎯 OBJECTIF :
 * - Permettre aux visiteurs de contacter le mécanicien
 * - Validation côté client avant envoi
 * - Envoi d'email via API Nodemailer
 * - Feedback visuel (succès/erreur)
 * 
 * 📍 UTILISÉ DANS :
 * - /src/app/contact/page.tsx (page de contact)
 * 
 * 🔧 CHAMPS DU FORMULAIRE :
 * - Nom (requis)
 * - Prénom (requis)
 * - Email (requis, validé)
 * - Téléphone (optionnel, format FR validé)
 * - Sujet (requis)
 * - Message (requis, min 10 caractères)
 * 
 * 🎨 FONCTIONNALITÉS :
 * - Validation en temps réel
 * - Messages d'erreur clairs
 * - Indicateur de chargement pendant l'envoi
 * - Réinitialisation automatique après succès
 * - Envoi via API /api/contact
 * 
 * 💡 AVANTAGES :
 * - UX fluide avec feedback immédiat
 * - Validation robuste côté client
 * - Gestion d'erreur complète
 * ============================================================================
 */

"use client";

import { useState, FormEvent } from "react";
import {
  validateEmail,
  validatePhone,
  validateSubject,
  validateMessage,
} from "@/utils/validation";

export default function ContactForm() {
  //! STATES pour stocker les valeurs des champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  //! STATE pour gérer l'affichage des messages de succès/erreur
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  
  //! STATE pour gérer l'état de chargement pendant l'envoi
  const [isSubmitting, setIsSubmitting] = useState(false);

  //! STATE pour les pièces jointes
  const [attachments, setAttachments] = useState<{ name: string; content: string }[]>([]);

  /**
   * Compresse une image côté client avant envoi (évite la limite Vercel de 4.5Mo)
   */
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir en JPEG, qualité 70%
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl.split(",")[1]); // Retourne juste le contenu Base64
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Gère la sélection de fichiers
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const newFiles = Array.from(e.target.files);
    
    if (attachments.length + newFiles.length > 4) {
      setStatus({ type: "error", message: "Vous ne pouvez pas envoyer plus de 4 photos." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "info", message: "Traitement des images en cours..." });

    try {
      const newAttachments = [...attachments];
      for (const file of newFiles) {
        if (!file.type.startsWith("image/")) continue; // Ignorer les non-images
        const base64 = await compressImage(file);
        newAttachments.push({
          name: file.name.replace(/\.[^/.]+$/, "") + ".jpg",
          content: base64
        });
      }
      setAttachments(newAttachments);
      setStatus(null);
    } catch (err) {
      setStatus({ type: "error", message: "Erreur lors du traitement des images." });
    } finally {
      setIsSubmitting(false);
      e.target.value = ''; // Reset l'input
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Fonction de validation du formulaire
   * Retourne un message d'erreur si une validation échoue, sinon null
   */
  const validate = () => {
    //! Vérification des champs de base
    if (!firstName.trim()) return "Le prénom est requis.";
    if (!lastName.trim()) return "Le nom est requis.";

    //! Validation email (format + requis)
    const emailError = validateEmail(email);
    if (emailError) return emailError;

    //! Validation téléphone (format français)
    const phoneError = validatePhone(phone);
    if (phoneError) return phoneError;

    //! Validation sujet (min 3 caractères)
    const subjectError = validateSubject(subject);
    if (subjectError) return subjectError;

    //! Validation message (min 10 caractères)
    const messageError = validateMessage(message);
    if (messageError) return messageError;

    //! Toutes les validations ont réussi
    return null;
  };

  /**
   * Fonction appelée lors de la soumission du formulaire
   * Gère la validation, l'envoi à l'API, et l'affichage du résultat
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); //! Empêche le rechargement de la page
    setStatus(null); //! Réinitialise le message précédent

    //! Étape 1 : Validation côté client
    const validationError = validate();
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return; // Arrête ici si erreur de validation
    }

    //! Active l'état de chargement
    setIsSubmitting(true);

    try {
      //! Étape 2 : Envoi des données à l'API
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, subject, message, attachments }),
      });

      if (!res.ok) throw new Error("Erreur d'envoi");

      //! Étape 3 : Succès - Affichage message + reset formulaire
      setStatus({ type: "success", message: "Votre message a bien été envoyé !" });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setAttachments([]);
    } catch {
      //! Étape 3 bis : Erreur - Affichage message d'erreur
      setStatus({ type: "error", message: "Impossible d'envoyer le message. Veuillez réessayer." });
    } finally {
      //! Désactive l'état de chargement dans tous les cas
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Demande d&apos;informations</h2>

      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nom *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none"
              placeholder=""
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Prénom *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none"
              placeholder=""
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:text-base focus:border-amber-500 focus:outline-none"
            placeholder="votre.email@exemple.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none "
            placeholder="Commençant par 06 ou 07"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Motif de votre demande *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none "
            placeholder="Devis, réparation, ou simple question"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Votre message *</label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm sm:text-base focus:border-orange-500 focus:outline-none resize-none"
            placeholder="Question, demande d’informations ou précisions sur une intervention."
          />
        </div>

        {/* Section Pièces Jointes */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Photos de votre véhicule (Max 4 photos)
          </label>
          
          <div className="flex items-center gap-4 mb-2">
            <label className={`flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded cursor-pointer transition-colors text-sm text-white ${attachments.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Ajouter des photos
              <input
                type="file"
                multiple
                accept="image/jpeg, image/png, image/webp, image/heic"
                className="hidden"
                onChange={handleFileChange}
                disabled={attachments.length >= 4 || isSubmitting}
              />
            </label>
            <span className="text-xs text-gray-400">
              {attachments.length} / 4
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3 italic">
            Pour l&apos;envoi de vidéos ou d&apos;autres documents, merci de privilégier WhatsApp.
          </p>

          {/* Liste des fichiers attachés */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-700 px-3 py-1.5 rounded-full border border-gray-600">
                  <span className="text-xs text-gray-200 truncate max-w-[120px]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-medium py-3 rounded transition-colors flex items-center justify-center space-x-2 ${
            isSubmitting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-amber-700 hover:bg-amber-800 cursor-pointer"
          } text-white`}
        >
          {isSubmitting ? (
            // Spinner animé pendant l'envoi
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Envoi en cours...</span>
            </>
          ) : (
            // Icône normale quand le formulaire n'est pas en cours d'envoi
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Envoyer</span>
            </>
          )}
        </button>

        {status && (
          <div className={`p-3 rounded text-sm ${
            status.type === "success" ? "bg-green-800/80 text-green-200 border border-green-700" : 
            status.type === "error" ? "bg-red-800/80 text-red-200 border border-red-700" :
            "bg-blue-800/80 text-blue-200 border border-blue-700"
          }`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}
