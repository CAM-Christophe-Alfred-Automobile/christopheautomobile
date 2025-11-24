/**
 * Utilitaires de validation de formulaires
 * 
 * Ce fichier contient des fonctions de validation réutilisables
 * pour valider les champs des formulaires côté client.
 * 
 * UTILISATION :
 * ```tsx
 * import { validateEmail, validatePhone } from '@/utils/validation';
 * 
 * const error = validateEmail(email);
 * if (error) {
 *   setError(error); // Afficher l'erreur
 * }
 * ```
 * 
 * CONVENTION :
 * - Retourne `null` si la validation réussit
 * - Retourne un message d'erreur (string) si la validation échoue
 */

/**
 * Valide une adresse email
 * 
 * @param email - Adresse email à valider
 * @returns null si valide, message d'erreur sinon
 * 
 * RÈGLES :
 * - Ne doit pas être vide
 * - Doit contenir un @ et un point
 * - Format général : quelquechose@quelquechose.quelquechose
 */
export function validateEmail(email: string): string | null {
    if (!email.trim()) return "L'adresse email est requise.";
    
    //! Regex simple pour email (pas parfaite mais suffisante)
    // Format: texte@texte.texte (ex: contact@garage.fr)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return regex.test(email) ? null : "Adresse email invalide.";
  }
  
  /**
   * Valide un numéro de téléphone français
   * 
   * @param phone - Numéro de téléphone à valider
   * @returns null si valide, message d'erreur sinon
   * 
   * FORMATS ACCEPTÉS :
   * - 06 12 34 56 78 (avec ou sans espaces)
   * - 0612345678
   * - +33612345678
   * - +33 6 12 34 56 78
   */
  export function validatePhone(phone: string): string | null {
    if (!phone.trim()) return "Le numéro de téléphone est requis.";
    
    //! Regex pour numéro français
    // - Commence par 0 ou +33
    // - Suivi de 1-9 (premier chiffre après l'indicatif)
    // - Puis 8 chiffres supplémentaires (4 paires)
    const regex = /^(?:\+33|0)[1-9](?:\d{2}){4}$/;
    
    return regex.test(phone) ? null : "Numéro de téléphone invalide (format FR attendu).";
  }
  
  /**
   * Valide le sujet d'un message
   * 
   * @param subject - Sujet à valider
   * @returns null si valide, message d'erreur sinon
   * 
   * RÈGLES :
   * - Ne doit pas être vide
   * - Minimum 3 caractères
   */
  export function validateSubject(subject: string): string | null {
    if (!subject.trim()) return "L'objet est requis.";
    
    return subject.trim().length >= 3
      ? null
      : "L'objet doit contenir au moins 3 caractères.";
  }
  
  /**
   * Valide le message d'un formulaire de contact
   * 
   * @param message - Message à valider
   * @returns null si valide, message d'erreur sinon
   * 
   * RÈGLES :
   * - Ne doit pas être vide
   * - Minimum 10 caractères (pour éviter les messages trop courts)
   */
  export function validateMessage(message: string): string | null {
    if (!message.trim()) return "Le message est requis.";
    
    return message.trim().length >= 10
      ? null
      : "Le message doit contenir au moins 10 caractères.";
  }