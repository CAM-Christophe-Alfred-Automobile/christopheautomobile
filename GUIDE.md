# 🔧 GUIDE COMPLET DU PROJET CAM

> **Guide de compréhension pour revenir sur le projet dans 6 mois**  
> Ce document explique TOUT ce qu'il faut savoir sur l'architecture, le fonctionnement et la maintenance du site.

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#vue-densemble-du-projet)
2. [Architecture technique](#architecture-technique)
3. [Structure des dossiers](#structure-des-dossiers)
4. [Fonctionnalités principales](#fonctionnalités-principales)
5. [Variables d'environnement](#variables-denvironnement)
6. [Pages et routes](#pages-et-routes)
7. [Composants réutilisables](#composants-réutilisables)
8. [Services et utilitaires](#services-et-utilitaires)
9. [Styling et thème](#styling-et-thème)
10. [Déploiement](#déploiement)
11. [Maintenance et évolutions](#maintenance-et-évolutions)

---

## 🎯 VUE D'ENSEMBLE DU PROJET

### Qu'est-ce que CAM ?

**CAM** est un site web pour Christophe, mécanicien à domicile, qui permet aux clients de :
- 📅 **Sélectionner des interventions et réserver** via un système intelligent connecté à Cal.com
- 🎯 **Choisir parmi 100+ services** organisés par catégories avec durées et prix
- 📧 **Contacter le garage** via un formulaire
- 🗺️ **Voir la zone d'intervention** sur une carte interactive
- 💰 **Consulter les tarifs dynamiques** avec code couleur automatique
- ℹ️ **Accéder aux mentions légales**

### Objectifs du site

1. **Simplifier la prise de rendez-vous** : Sélection d'interventions avec calcul automatique de durée
2. **Présenter les services** : Base de données JSON de 100+ services avec prix et durées
3. **Tarifs transparents** : Affichage dynamique avec code couleur (vert/jaune/rouge)
4. **Géolocalisation** : Carte interactive montrant la zone d'intervention (30km autour de Salon-de-Provence)
5. **Contact facile** : Formulaire de contact avec envoi d'email automatique

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack technologique

```
Frontend:
- Next.js 15 (App Router) - Framework React avec SSR/SSG
- React 18 - Bibliothèque UI
- TypeScript - Typage statique
- Tailwind CSS - Framework CSS utilitaire

Intégrations externes:
- Cal.com - Système de réservation (iframe intégré)
- Leaflet - Cartes interactives OpenStreetMap
- Nodemailer - Envoi d'emails

Outils de développement:
- pnpm - Gestionnaire de packages
- ESLint - Linting du code
- FontAwesome - Icônes
```

### Pourquoi ces technologies ?

- **Next.js 15** : SEO optimal, performance, routing facile, rendu hybride (SSR/SSG)
- **Cal.com** : Évite de développer un système de réservation complet (calendrier, paiements, notifications)
- **Leaflet** : Alternative open-source gratuite à Google Maps
- **Tailwind CSS** : Développement rapide, design cohérent, responsive facile

---

## 📁 STRUCTURE DES DOSSIERS

```
cam/
│
├── src/
│   ├── app/                          # Pages et routes (App Router Next.js)
│   │   ├── api/                      # Routes API
│   │   │   └── contact/
│   │   │       └── route.ts          # API POST pour le formulaire de contact
│   │   │
│   │   ├── data/                     # Données JSON
│   │   │   └── services.json         # Base de données des services (100+ interventions)
│   │   │
│   │   ├── booking/                  # Page de réservation intelligente
│   │   │   ├── layout.tsx            # Layout avec force-dynamic
│   │   │   └── page.tsx              # Sélection interventions + calcul durée + Cal.com
│   │   │
│   │   ├── confirmation/             # Page de confirmation après paiement
│   │   │   ├── layout.tsx            # Layout avec force-dynamic
│   │   │   └── page.tsx              # Message de confirmation
│   │   │
│   │   ├── contact/                  # Page de contact
│   │   │   ├── layout.tsx            # Layout avec force-dynamic
│   │   │   └── page.tsx              # Formulaire + Carte Leaflet
│   │   │
│   │   ├── mentions-legales/         # Mentions légales
│   │   │   └── page.tsx              # Infos légales obligatoires
│   │   │
│   │   ├── tarifs/                   # Page des tarifs dynamiques
│   │   │   └── page.tsx              # Génération depuis JSON avec code couleur
│   │   │
│   │   ├── layout.tsx                # Layout global (HTML, fonts, metadata)
│   │   ├── page.tsx                  # Page d'accueil
│   │   └── globals.css               # Styles globaux
│   │
│   ├── components/                   # Composants React réutilisables
│   │   ├── home/
│   │   │   ├── HeroSection.tsx       # Section héro page d'accueil
│   │   │   ├── AtelierSection.tsx    # Section atelier
│   │   │   └── PrestationsSection.tsx # Section prestations
│   │   ├── ContactForm.tsx           # Formulaire de contact
│   │   ├── Footer.tsx                # Pied de page
│   │   ├── Header.tsx                # Navigation + menu burger
│   │   ├── MapZone.tsx               # Carte Leaflet (zone d'intervention)
│   │   ├── SelectCategorie.tsx       # Sélecteur de catégorie
│   │   ├── CategoryAccordion.tsx     # Accordéon catégories
│   │   ├── ServiceCard.tsx           # Carte service
│   │   ├── WhatsappFloat.tsx         # Bouton WhatsApp flottant
│   │   ├── NeonCAM.tsx               # Logo néon animé
│   │   └── index.ts                  # Barrel export des composants
│   │
│   ├── services/                     # Services métier
│   │   └── email.ts                  # Service d'envoi d'emails (Nodemailer)
│   │
│   ├── config/
│   │   ├── metadata.ts               # Configuration SEO
│   │   └── site.ts                   # Configuration du site
│   │
│   ├── utils/                        # Utilitaires
│   │   └── validation.ts             # Validation des formulaires
│   │
│   └── fonts/
│       └── index.ts                  # Polices personnalisées
│
├── public/                           # Fichiers statiques (si besoin)
│
├── .env                              # Variables d'environnement (NE PAS COMMIT)
├── .env.example                      # Template des variables d'env
├── package.json                      # Dépendances npm
├── pnpm-lock.yaml                    # Lock file pnpm
├── tsconfig.json                     # Configuration TypeScript
├── next.config.ts                    # Configuration Next.js
├── tailwind.config.ts                # Configuration Tailwind
├── postcss.config.mjs                # Configuration PostCSS
├── eslint.config.mjs                 # Configuration ESLint
│
├── DEPLOY_DOCKER.MD                  # Guide déploiement Docker
├── SERVICES_JSON.md                  # Documentation du système JSON
├── GUIDE.md                          # Ce fichier (guide complet)
└── README.md                         # Readme du projet
```

---

## ⚙️ FONCTIONNALITÉS PRINCIPALES

### 1. 📅 Système de réservation intelligent

**Fichiers** : 
- Page : `src/app/booking/page.tsx`
- Données : `src/app/data/services.json`

**Comment ça fonctionne ?**

#### Étape 1 : Sélection de la catégorie
Le client choisit parmi 10 catégories :
- Entretien & vidanges
- Freinage
- Distribution / Moteur
- Refroidissement
- Transmission / Embrayage
- Train roulant / Suspension
- Électricité / Électronique
- Climatisation
- Diagnostic / Contrôles
- Déplacement / Divers
- **Autre / Sur mesure** (durée personnalisée)

#### Étape 2 : Sélection des interventions
- Affichage des services de la catégorie avec durées
- Sélection multiple possible
- Récapitulatif en temps réel avec possibilité de retirer

#### Étape 3 : Calcul automatique
```typescript
const durees = servicesData
  .filter((s) => selected.includes(s.service))
  .map((s) => s.duree);
const total = durees.reduce((acc, cur) => acc + cur, 0);
```

#### Étape 4 : Redirection Cal.com
Selon la durée totale, redirection vers l'événement correspondant :

| Durée | Événement Cal.com |
|-------|-------------------|
| ≤ 60 min | `/1h` |
| ≤ 90 min | `/1h30` |
| ≤ 120 min | `/2h` |
| ≤ 150 min | `/2h30` |
| ≤ 180 min | `/3h` |
| ≤ 240 min | `/4h` |
| ≤ 300 min | `/5h` |
| ≤ 360 min | `/6h` |
| > 360 min | `/journee-complete` |

#### Option "Autre / Sur mesure"
- Slider de 1h à 8h (par tranches de 30 min)
- Pour interventions convenues avec le mécanicien
- Pour besoins non listés

**Points importants** :
- Le layout force le rendu dynamique (`force-dynamic`)
- Si durée > 8h : alerte avec contact direct
- Cal.com gère : calendrier, paiements, notifications

---

### 1.5 🗂️ Base de données JSON

**Fichier** : `src/app/data/services.json`

**Structure d'un service** :
```json
{
  "categorie": "Entretien & vidanges",
  "service": "Vidange moteur",
  "description": "huile moteur uniquement",
  "duree": 60,
  "prix": 50
}
```

**Utilisation** :
- **Page Booking** : Sélection d'interventions
- **Page Tarifs** : Affichage automatique des prix

**Documentation complète** : Voir `SERVICES_JSON.md`

---

### 2. 📧 Formulaire de contact

**Fichiers** :
- Composant : `src/components/ContactForm.tsx`
- API : `src/app/api/contact/route.ts`
- Service email : `src/services/email.ts`

**Flux de fonctionnement** :

```
1. Client remplit le formulaire (nom, email, téléphone, sujet, message)
   ↓
2. Validation côté client (champs requis)
   ↓
3. Envoi POST vers /api/contact
   ↓
4. API valide les données
   ↓
5. Appel du service sendContactEmail()
   ↓
6. Nodemailer envoie l'email via Gmail SMTP
   ↓
7. Réponse success/error au client
   ↓
8. Message de confirmation affiché
```

**Configuration email (Nodemailer)** :
- Utilise Gmail SMTP
- Nécessite un "App Password" Google (pas le mot de passe normal)
- Variables d'env : `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`

---

### 3. 🗺️ Carte interactive (Leaflet)

**Fichier** : `src/components/MapZone.tsx`

**Comment ça fonctionne ?**
- Utilise Leaflet (alternative open-source à Google Maps)
- Affiche un cercle de 30km autour de Salon-de-Provence
- **Important** : Le composant est chargé dynamiquement avec `ssr: false`

**Pourquoi `ssr: false` ?**
```tsx
const MapZone = dynamic(() => import("@/components/MapZone"), {
  ssr: false,  // ← Crucial ! Leaflet utilise `window` qui n'existe pas côté serveur
});
```

Leaflet utilise des APIs du navigateur (`window`, `document`) qui n'existent pas lors du rendu serveur Next.js. En désactivant SSR, la carte se charge uniquement côté client.

**Fix des lignes blanches** :
```css
.leaflet-tile-container {
  background-color: #dcdcdc;
}
.leaflet-tile {
  transform: translateZ(0);  /* Fix GPU rendering */
}
```

---

### 4. 💰 Page Tarifs Dynamique

**Fichiers** :
- Page : `src/app/tarifs/page.tsx`
- Données : `src/app/data/services.json`

**Comment ça fonctionne ?**

#### Génération automatique
Les tarifs sont générés automatiquement depuis le fichier JSON :
```typescript
const categories = Array.from(new Set(servicesData.map((s) => s.categorie)));
```

#### Code couleur automatique
Les prix sont colorés selon leur montant :

| Couleur | Plage | Classe CSS |
|---------|-------|------------|
| 🟢 Vert | < 100€ | `text-green-400` |
| 🟡 Jaune | 100-300€ | `text-yellow-400` |
| 🔴 Rouge | > 300€ | `text-red-400` |
| ⚪ Gris | Sur devis | `text-gray-500` |

```typescript
const getPrixColor = (prix: number | string | undefined) => {
  if (!prix) return "text-gray-500";
  const prixNum = typeof prix === "string" ? parseInt(prix.split("-")[0]) : prix;
  if (prixNum < 100) return "text-green-400";
  if (prixNum >= 100 && prixNum <= 300) return "text-yellow-400";
  return "text-red-400";
};
```

#### Layout Masonry
- 2 colonnes sur desktop
- Les catégories s'empilent naturellement (pas d'espaces vides)
- Responsive : 1 colonne sur mobile

#### Affichage par service
Pour chaque service :
- Nom du service
- Description (si présente)
- Durée estimée
- Prix avec code couleur

**Pour modifier les tarifs** :
1. Ouvrir `src/app/data/services.json`
2. Modifier le champ `prix` du service
3. Sauvegarder → Les changements sont immédiats

---

## 🔐 VARIABLES D'ENVIRONNEMENT

**Fichier** : `.env` (non committé, secret)  
**Template** : `.env.example` (committé, pour documentation)

### Variables nécessaires

```bash
# Configuration Nodemailer (Email)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-app-password-google
EMAIL_TO=email-destinataire@gmail.com

# Configuration Next.js (Images externes)
NEXT_PUBLIC_TARIFS_IMAGE=https://res.cloudinary.com/.../tarifs.png

# (Optionnel) Cal.com
NEXT_PUBLIC_CAL_LINK=mjm-k0dwpg
```

### ⚠️ IMPORTANT : App Password Gmail

Pour `EMAIL_PASS`, vous **ne devez PAS** utiliser votre mot de passe Gmail normal !

**Étapes pour créer un App Password** :
1. Allez sur https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Allez dans "App Passwords"
4. Générez un mot de passe pour "Mail"
5. Copiez le mot de passe à 16 caractères
6. Mettez-le dans `.env` comme `EMAIL_PASS`

### Configuration Next.js pour les images

Dans `next.config.ts` :
```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',  // Cloudinary
    },
  ],
}
```

---

## 🛣️ PAGES ET ROUTES

### Routes principales

| Route | Fichier | Description | Type |
|-------|---------|-------------|------|
| `/` | `app/page.tsx` | Page d'accueil | SSG |
| `/booking` | `app/booking/page.tsx` | Réservation Cal.com | Dynamic |
| `/contact` | `app/contact/page.tsx` | Formulaire + Carte | Dynamic |
| `/tarifs` | `app/tarifs/page.tsx` | Tarifs (image) | SSG |
| `/mentions-legales` | `app/mentions-legales/page.tsx` | Mentions légales | SSG |
| `/confirmation` | `app/confirmation/page.tsx` | Après réservation | Dynamic |
| `/404` | `app/not-found.tsx` | Page 404 personnalisée | SSG |
| `/api/contact` | `app/api/contact/route.ts` | API POST contact | API |

### Layouts spéciaux

Certaines pages ont un layout avec `force-dynamic` et `revalidate: 0` :
- `/booking/layout.tsx`
- `/contact/layout.tsx`
- `/confirmation/layout.tsx`

**Pourquoi ?**  
Cela force Next.js à toujours re-render ces pages côté serveur (pas de cache statique). Utile pour :
- Le calendrier Cal.com (toujours à jour)
- Le formulaire de contact (données fraîches)
- La confirmation (après paiement)

---

## 🧩 COMPOSANTS RÉUTILISABLES

### Header (Navigation)

**Fichier** : `src/components/Header.tsx`

**Fonctionnalités** :
- Navigation desktop (liens horizontaux)
- Menu burger mobile (responsive)
- Indicateur de page active (bordure blanche)
- Logo cliquable qui ramène à l'accueil

**Structure** :
```
Header
├── Logo (CAM)
├── Navigation Desktop (masqué sur mobile)
│   ├── Accueil
│   ├── Tarifs
│   ├── Réserver
│   └── Contact
└── Menu Burger (masqué sur desktop)
    └── Menu déroulant avec liens centrés
```

**Classes Tailwind importantes** :
- `hidden md:flex` : Caché sur mobile, visible sur desktop
- `md:hidden` : Visible sur mobile, caché sur desktop

---

### Footer (Pied de page)

**Fichier** : `src/components/Footer.tsx`

**Contenu** :
- Logo CAM réduit
- Liens légaux (Mentions légales)
- Copyright avec année dynamique
- Design minimaliste et épuré

---

### ContactForm

**Fichier** : `src/components/ContactForm.tsx`

**Champs** :
- Prénom* (requis)
- Nom* (requis)
- Email* (requis)
- Téléphone (optionnel)
- Sujet* (requis)
- Message* (requis)

**Gestion des états** :
```tsx
const [formData, setFormData] = useState({...});  // Données du formulaire
const [status, setStatus] = useState('idle');     // 'idle' | 'loading' | 'success' | 'error'
const [error, setError] = useState('');           // Message d'erreur
```

**Flux de soumission** :
1. Validation côté client (champs requis)
2. `setStatus('loading')` → Affiche le spinner
3. `fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })`
4. Si succès : `setStatus('success')` + reset du formulaire
5. Si erreur : `setStatus('error')` + affichage du message

---

### MapZone

**Fichier** : `src/components/MapZone.tsx`

**Configuration de la carte** :
```tsx
center: [43.6403, 5.0978],  // Coordonnées de Salon-de-Provence
zoom: 11,
scrollWheelZoom: false,     // Désactive le zoom à la molette (UX)
```

**Couches affichées** :
- `TileLayer` : Tuiles OpenStreetMap
- `Circle` : Cercle de 30km (rayon 30000m)
- `Marker` : Pin sur Salon-de-Provence

**Styling du cercle** :
```tsx
<Circle
  center={center}
  radius={20000}
  pathOptions={{
    color: '#3b82f6',        // Bleu
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    weight: 2
  }}
/>
```

---

## 🎨 STYLING ET THÈME

### Tailwind CSS

**Fichier de config** : `tailwind.config.ts`

**Couleurs principales** :
- Fond principal : `bg-gray-900` (noir/gris très foncé)
- Fond secondaire : `bg-gray-800` (gris foncé)
- Accent principal : `text-amber-600`, `bg-amber-700` (orange/ambre)
- Texte : `text-white`, `text-gray-300`, `text-gray-400`

**Exemple d'utilisation** :
```tsx
<div className="bg-gray-900 text-white">
  <button className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded">
    Réserver
  </button>
</div>
```

### Globals CSS

**Fichier** : `src/app/globals.css`

**Contenu** :
1. Import Tailwind
2. Import Leaflet CSS
3. Configuration fonts Geist
4. Fix Cal.com (masquer boutons indésirables)
5. Fix Leaflet (lignes blanches entre tuiles)

**Styles Cal.com** :
```css
/* Masque les boutons "Overlay calendar" de Cal.com */
.cal-overlay-button,
[data-testid="overlay-calendar"] {
  display: none !important;
}
```

---

## 📦 SERVICES ET UTILITAIRES

### Service Email (Nodemailer)

**Fichier** : `src/services/email.ts`

**Fonction** : `sendContactEmail()`

**Configuration SMTP** :
```ts
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,  // App Password !
  },
});
```

**Template d'email** :
```html
<h2>Nouveau message de contact</h2>
<p><strong>De:</strong> {firstName} {lastName}</p>
<p><strong>Email:</strong> {email}</p>
<p><strong>Téléphone:</strong> {phone}</p>
<p><strong>Sujet:</strong> {subject}</p>
<hr>
<p>{message}</p>
```

**Gestion des erreurs** :
- Si l'email échoue, une erreur est throwée
- L'API route la catch et renvoie un statut 500

---

### Validation

**Fichier** : `src/utils/validation.ts`

**Fonctions** :
- `isValidEmail(email: string): boolean` : Validation regex email
- `isValidPhone(phone: string): boolean` : Validation téléphone français

**Exemple** :
```ts
if (!isValidEmail(formData.email)) {
  setError("Email invalide");
  return;
}
```

---

## 🚀 DÉPLOIEMENT

### Développement local

```bash
# Installation des dépendances
pnpm install

# Démarrage du serveur de dev
pnpm run dev

# Build de production
pnpm run build

# Démarrage du serveur de production
pnpm start
```

### Variables d'environnement en production

**Vercel / Netlify** :
1. Allez dans les settings du projet
2. Section "Environment Variables"
3. Ajoutez toutes les variables de `.env` :
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_TO`
   - `NEXT_PUBLIC_TARIFS_IMAGE`

### Déploiement Vercel (recommandé)

```bash
# Installation de Vercel CLI
pnpm install -g vercel

# Déploiement
vercel

# Déploiement en production
vercel --prod
```

**Configuration automatique** :
- Vercel détecte Next.js automatiquement
- Build command : `next build`
- Output directory : `.next`
- Node version : 20.x ou supérieur (requis pour Next.js 16+)

---

## 🔧 MAINTENANCE ET ÉVOLUTIONS

### Mise à jour vers Next.js 16 et Node.js 20

Le projet a été mis à jour vers Next.js 16.0.7 et React 19.2.1 pour résoudre des vulnérabilités signalées par Vercel.

**Prérequis important :** Next.js 16 nécessite Node.js 20.9.0 ou supérieur.

**Commandes pour mettre à jour Node.js via NVM :**
```bash
# Installation de Node.js 20
nvm install 20

# Utilisation de Node.js 20
nvm use 20

# Définir comme version par défaut
nvm alias default 20
```

**Commandes pour mettre à jour Next.js et React :**
```bash
pnpm add next@latest react@latest react-dom@latest
```

**Note :** Aucune modification de code n'a été nécessaire pour cette mise à jour, mais assurez-vous toujours de tester l'application après une mise à jour majeure.

### Modifier les tarifs

1. Créez/modifiez l'image des tarifs
2. Uploadez sur Cloudinary (ou autre)
3. Copiez la nouvelle URL
4. Mettez à jour `.env` : `NEXT_PUBLIC_TARIFS_IMAGE=...`
5. Redéployez (ou redémarrez en local)

### Modifier la zone d'intervention

Dans `src/components/MapZone.tsx` :
```tsx
// Changer les coordonnées du centre
const center: [number, number] = [43.6403, 5.0978];

// Changer le rayon (en mètres)
<Circle radius={30000} />  // 30km au lieu de 20km
```

### Changer le lien Cal.com

Dans `src/app/booking/page.tsx` :
```tsx
<Cal calLink="VOTRE-NOUVEAU-LIEN" />
```

### Ajouter une nouvelle page

1. Créez un dossier dans `src/app/` : `src/app/ma-page/`
2. Créez `page.tsx` :
```tsx
import { Header, Footer } from "@/components";

export default function MaPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Votre contenu */}
      </main>
      <Footer />
    </div>
  );
}
```
3. Ajoutez le lien dans le Header

### Ajouter un nouveau composant

1. Créez le fichier dans `src/components/` : `MonComposant.tsx`
2. Exportez-le dans `src/components/index.ts` :
```ts
export { default as MonComposant } from "./MonComposant";
```
3. Importez-le où vous en avez besoin :
```ts
import { MonComposant } from "@/components";
```

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Erreur "window is not defined" (Leaflet)

**Cause** : Leaflet est importé côté serveur  
**Solution** : Utilisez `dynamic` avec `ssr: false`

```tsx
const MapZone = dynamic(() => import("@/components/MapZone"), {
  ssr: false,
});
```

### Emails ne partent pas

**Vérifications** :
1. ✅ Vous utilisez un **App Password** Gmail (pas votre mot de passe normal)
2. ✅ Les variables d'env sont bien définies dans `.env`
3. ✅ Le serveur a été redémarré après modification du `.env`
4. ✅ Gmail n'a pas bloqué l'accès (vérifiez vos emails de sécurité)

### Cal.com ne s'affiche pas

**Vérifications** :
1. ✅ Votre lien Cal.com est correct (`calLink="..."`)
2. ✅ Votre compte Cal.com est bien configuré
3. ✅ L'iframe n'est pas bloquée par un adblocker

### Images ne se chargent pas

**Vérifications** :
1. ✅ L'URL de l'image est correcte dans `.env`
2. ✅ Le domaine est autorisé dans `next.config.ts` (`remotePatterns`)
3. ✅ L'image existe et est accessible publiquement

---

## 📚 RESSOURCES UTILES

### Documentation officielle

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cal.com Embed](https://cal.com/docs/platform/embed)
- [Leaflet](https://leafletjs.com/)
- [Nodemailer](https://nodemailer.com/)

### Tutoriels

- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)
- [React Leaflet Guide](https://react-leaflet.js.org/)

---

## ✅ CHECKLIST DE DÉMARRAGE RAPIDE

Quand vous revenez sur le projet après 6 mois :

- [ ] Lire ce GUIDE.md en entier
- [ ] Vérifier que `.env` est bien configuré
- [ ] Installer les dépendances : `pnpm install`
- [ ] Lancer le serveur : `pnpm run dev`
- [ ] Tester chaque page :
  - [ ] Page d'accueil : http://localhost:3000
  - [ ] Réservation : http://localhost:3000/booking
  - [ ] Contact : http://localhost:3000/contact
  - [ ] Tarifs : http://localhost:3000/tarifs
- [ ] Tester le formulaire de contact (vérifier que l'email arrive)
- [ ] Vérifier que la carte s'affiche correctement

---

## 🎓 CONCEPTS CLÉS À RETENIR

### 1. Next.js App Router

Les dossiers dans `src/app/` deviennent automatiquement des routes :
- `src/app/page.tsx` → `/`
- `src/app/contact/page.tsx` → `/contact`
- `src/app/api/contact/route.ts` → `/api/contact`

### 2. Force Dynamic

Certains layouts ont `export const dynamic = 'force-dynamic'` :
- Cela désactive le cache statique
- La page est toujours rendue côté serveur
- Utile pour des données qui changent souvent

### 3. SSR vs CSR

- **SSR** (Server-Side Rendering) : Rendu côté serveur, bon pour le SEO
- **CSR** (Client-Side Rendering) : Rendu côté client, nécessaire pour Leaflet

### 4. Barrel Exports

`src/components/index.ts` exporte tous les composants :
```ts
export { default as Header } from "./Header";
export { default as Footer } from "./Footer";
```

Permet d'importer facilement :
```ts
import { Header, Footer } from "@/components";
```

---

## 📞 CONTACT ET SUPPORT

Pour toute question sur ce projet, référez-vous à :
- Ce fichier `GUIDE.md`
- `README.md` pour la vue d'ensemble
- `SERVICES_JSON.md` pour la documentation des services
- `DEPLOY_DOCKER.MD` pour le déploiement Docker

---

**Dernière mise à jour** : Octobre 2025  
**Version du projet** : 1.0.0  
**Auteur** : MJM Coding
