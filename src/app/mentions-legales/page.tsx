/**
 * Page des mentions légales (/mentions-legales)
 * 
 * Cette page affiche les informations légales obligatoires pour tout site web professionnel en France.
 * Elle respecte les obligations de :
 * - La loi LCEN (Loi pour la Confiance dans l'Économie Numérique)
 * - Le RGPD (Règlement Général sur la Protection des Données)
 * - L'article L.111-1 du Code de la consommation
 * 
 * SECTIONS OBLIGATOIRES :
 * 1. Éditeur du site (identité, SIRET, contact)
 * 2. Hébergement (informations sur l'hébergeur)
 * 3. Directeur de publication
 * 4. Propriété intellectuelle
 * 5. Protection des données personnelles (RGPD)
 * 6. Cookies et traceurs
 * 7. Responsabilité et droit applicable
 * 
 * IMPORTANT :
 * Pour un auto-entrepreneur/micro-entrepreneur, les mentions obligatoires incluent :
 * - Nom et prénom
 * - Adresse du siège social
 * - Numéro SIRET
 * - Email et téléphone
 * - Informations sur l'hébergeur
 */

import { Header, Footer } from "@/components";
import { siteConfig } from "@/config/site";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 w-full">
        <div className="bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg border border-gray-700">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">Mentions Légales</h1>

          <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 italic">
            Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique, 
            il est précisé aux utilisateurs du site {siteConfig.url} l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
          </p>

          {/* 1. ÉDITEUR DU SITE */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">1. Éditeur du site</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p><strong>Raison sociale :</strong> {siteConfig.name}</p>
              <p><strong>Statut juridique :</strong> Auto-entrepreneur / Micro-entreprise</p>
              <p><strong>Adresse du siège social :</strong> {siteConfig.address}</p>
              <p><strong>Téléphone :</strong> <a href={`tel:${siteConfig.phone}`} className="text-amber-400 hover:underline">{siteConfig.phone}</a></p>
              <p><strong>Email :</strong> <a href={`mailto:${siteConfig.email}`} className="text-amber-400 hover:underline">{siteConfig.email}</a></p>
              <p><strong>N° SIRET :</strong> {siteConfig.legal.siret}</p>
              <p className="text-sm text-gray-400 mt-2">
                ℹ️ En tant qu&apos;auto-entrepreneur, dispensé d&apos;immatriculation au RCS (Registre du Commerce et des Sociétés) 
                conformément à l&apos;article L.123-1-1 du Code de commerce.
              </p>
            </div>
          </section>

          {/* 2. DIRECTEUR DE PUBLICATION */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">2. Directeur de la publication</h2>
            <p className="text-sm sm:text-base text-gray-300">
              <strong>Directeur de la publication :</strong> {siteConfig.legal.ownerName}<br />
              <strong>Contact :</strong> <a href={`mailto:${siteConfig.email}`} className="text-amber-400 hover:underline">{siteConfig.email}</a>
            </p>
          </section>

          {/* 3. HÉBERGEMENT */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">3. Hébergement du site</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">https://vercel.com</a></p>
              <p className="text-sm text-gray-400 mt-2">
                ℹ️ Vercel est une plateforme d&apos;hébergement cloud conforme RGPD avec des serveurs situés dans l&apos;Union Européenne.
              </p>
            </div>
          </section>

          {/* 4. DÉVELOPPEMENT */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">4. Conception et développement</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p><strong>Développeur :</strong> MJM Coding - Jessica MOSCATO</p>
              <p><strong>Site web :</strong> <a href="https://www.mjm-coding.fr" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">www.mjm-coding.fr</a></p>
            </div>
          </section>

          {/* 5. PROPRIÉTÉ INTELLECTUELLE */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">5. Propriété intellectuelle</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3">
              <p>
                L&apos;ensemble de ce site web (structure, textes, logos, images, vidéos, éléments graphiques, etc.) 
                est la propriété exclusive de {siteConfig.name} ou de ses partenaires, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, 
                quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable.
              </p>
              <p>
                Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée 
                comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants 
                du Code de Propriété Intellectuelle.
              </p>
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} {siteConfig.name} - Tous droits réservés
              </p>
            </div>
          </section>

          {/* 6. PROTECTION DES DONNÉES PERSONNELLES (RGPD) */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">6. Protection des données personnelles (RGPD)</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">6.1. Responsable du traitement</h3>
                <p>
                  Le responsable du traitement des données personnelles collectées sur ce site est : {siteConfig.name}, 
                  joignable à l&apos;adresse email : <a href={`mailto:${siteConfig.email}`} className="text-amber-400 hover:underline">{siteConfig.email}</a>
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">6.2. Données collectées</h3>
                <p>Les données personnelles collectées sur ce site sont :</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>Formulaire de contact :</strong> Nom, prénom, email, téléphone, message</li>
                  <li><strong>Réservation Cal.com :</strong> Nom, prénom, email, téléphone, date et heure de rendez-vous</li>
                  <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées (via Cal.com)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">6.3. Finalité du traitement</h3>
                <p>Les données personnelles sont collectées pour les finalités suivantes :</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Traiter vos demandes de contact et de réservation</li>
                  <li>Gérer les rendez-vous et interventions</li>
                  <li>Améliorer nos services et l&apos;expérience utilisateur</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">6.4. Durée de conservation</h3>
                <p>
                  Les données personnelles sont conservées pendant la durée nécessaire à la réalisation des finalités mentionnées ci-dessus :
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>Formulaire de contact :</strong> 3 ans à compter du dernier contact</li>
                  <li><strong>Réservations :</strong> Durée légale de conservation des documents comptables (10 ans)</li>
                  <li><strong>Données de navigation :</strong> 13 mois maximum</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">6.5. Vos droits</h3>
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>Droit d&apos;accès :</strong> Obtenir la confirmation que vos données sont traitées et y accéder</li>
                  <li><strong>Droit de rectification :</strong> Faire corriger vos données inexactes ou incomplètes</li>
                  <li><strong>Droit à l&apos;effacement :</strong> Demander la suppression de vos données</li>
                  <li><strong>Droit à la limitation :</strong> Demander la limitation du traitement de vos données</li>
                  <li><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                </ul>
                <p className="mt-3">
                  Pour exercer ces droits, contactez-nous à : <a href={`mailto:${siteConfig.email}`} className="text-amber-400 hover:underline">{siteConfig.email}</a>
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Vous disposez également du droit d&apos;introduire une réclamation auprès de la CNIL (Commission Nationale de l&apos;Informatique et des Libertés) : 
                  <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline ml-1">www.cnil.fr</a>
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">6.6. Sécurité des données</h3>
                <p>
                  Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour garantir la sécurité 
                  et la confidentialité de vos données personnelles (chiffrement HTTPS, serveurs sécurisés, accès restreints).
                </p>
              </div>
            </div>
          </section>

          {/* 7. COOKIES ET TRACEURS */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">7. Cookies et traceurs</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3">
              <p>
                Ce site utilise uniquement des cookies strictement nécessaires à son fonctionnement et des cookies de services tiers 
                pour la réservation en ligne et l&apos;affichage de la carte interactive.
              </p>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">7.1. Types de cookies utilisés</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong>Cookies techniques Next.js :</strong> Nécessaires au fonctionnement du site (navigation, sécurité). 
                    Ces cookies sont exemptés de consentement car strictement nécessaires.
                  </li>
                  <li>
                    <strong>Cal.com (réservation) :</strong> Service tiers utilisé pour la prise de rendez-vous. 
                    Cal.com peut déposer ses propres cookies pour gérer les réservations et améliorer son service.
                    <br />
                    <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline text-sm">
                      → Politique de confidentialité Cal.com
                    </a>
                  </li>
                  <li>
                    <strong>Leaflet (carte interactive) :</strong> Bibliothèque open-source pour afficher la carte de la zone d&apos;intervention. 
                    Peut stocker des préférences de cache pour les tuiles de carte.
                  </li>
                </ul>
                <p className="mt-3 text-sm text-gray-400">
                  ℹ️ <strong>Aucun cookie de tracking publicitaire ou d&apos;analyse d&apos;audience</strong> (Google Analytics, Facebook Pixel, etc.) 
                  n&apos;est utilisé sur ce site.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">7.2. Gestion des cookies</h3>
                <p>
                  Vous pouvez à tout moment configurer vos préférences en matière de cookies via les paramètres de votre navigateur :
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                  <li><strong>Firefox :</strong> Préférences → Vie privée et sécurité → Cookies</li>
                  <li><strong>Safari :</strong> Préférences → Confidentialité → Cookies</li>
                  <li><strong>Edge :</strong> Paramètres → Confidentialité → Cookies</li>
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  ⚠️ La désactivation des cookies peut affecter le bon fonctionnement du système de réservation.
                </p>
              </div>
            </div>
          </section>

          {/* 8. RESPONSABILITÉ ET DROIT APPLICABLE */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">8. Responsabilité et droit applicable</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">8.1. Limitation de responsabilité</h3>
                <p>
                  {siteConfig.name} s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur ce site. 
                  Toutefois, nous ne pouvons garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
                </p>
                <p className="mt-2">
                  {siteConfig.name} ne saurait être tenu responsable des dommages directs ou indirects résultant de l&apos;accès au site 
                  ou de l&apos;utilisation de celui-ci, y compris l&apos;inaccessibilité, les pertes de données, détériorations, destructions 
                  ou virus qui pourraient affecter l&apos;équipement informatique de l&apos;utilisateur.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">8.2. Liens hypertextes</h3>
                <p>
                  Ce site peut contenir des liens hypertextes vers d&apos;autres sites (Cal.com, Leaflet, etc.). 
                  {siteConfig.name} n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">8.3. Droit applicable et juridiction</h3>
                <p>
                  Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut d&apos;accord amiable, 
                  le litige sera porté devant les tribunaux français conformément aux règles de compétence en vigueur.
                </p>
              </div>
            </div>
          </section>

          {/* 9. ASSURANCE PROFESSIONNELLE */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">9. Assurance professionnelle</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p>
                Dans le cadre de son activité de réparation et de vente de véhicules automobiles, {siteConfig.name}
                est couvert par une assurance Responsabilité Civile Professionnelle et Responsabilité Civile Automobile.
              </p>
              <p><strong>Assureur :</strong> Groupama Assurances (contrat GARASSUR)</p>
              <p><strong>Courtier :</strong> ETIK Assurance</p>
              <p className="text-sm text-gray-400 mt-2">
                ℹ️ Attestation d&apos;assurance disponible sur demande auprès de {siteConfig.name}.
              </p>
            </div>
          </section>

          {/* 10. CONTACT */}
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-600 mb-3 sm:mb-4">10. Contact</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p>Pour toute question concernant ces mentions légales ou l&apos;utilisation de vos données personnelles, vous pouvez nous contacter :</p>
              <ul className="list-none ml-4 mt-3 space-y-2">
                <li>📧 <strong>Email :</strong> <a href={`mailto:${siteConfig.email}`} className="text-amber-400 hover:underline">{siteConfig.email}</a></li>
                <li>📞 <strong>Téléphone :</strong> <a href={`tel:${siteConfig.phone}`} className="text-amber-400 hover:underline">{siteConfig.phone}</a></li>
                <li>📍 <strong>Adresse :</strong> {siteConfig.address}</li>
              </ul>
            </div>
          </section>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-700 text-center text-xs sm:text-sm text-gray-400">
            <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}