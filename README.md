# 🔧 CAM - Site de Réservation pour Mécanicien à Domicile

Site web professionnel pour **Christophe**, mécanicien à domicile. Conçu pour offrir une expérience utilisateur moderne, rapide et accessible, permettant aux clients de réserver en ligne et de contacter facilement le professionnel.

🔗 **Site en ligne** : [cam-mecanique.vercel.app](https://cam-mecanique.vercel.app)  
👨‍🔧 **Pour** : Christophe - Mécanicien à domicile  
👩‍💻 **Développé par** : [MJM Coding](https://github.com/MJM-Coding)

---

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies utilisées](#️-technologies-utilisées)
- [Installation](#-installation)
- [Structure du projet](#-structure-du-projet)
- [Configuration](#-configuration)
- [Scripts disponibles](#-scripts-disponibles)
- [Déploiement](#-déploiement)
- [Optimisations](#-optimisations)
- [Documentation](#-documentation)
- [Auteur](#-auteur)
- [Licence](#-licence)

---

## 🎯 À propos

**CAM** est un site moderne et responsive destiné à Christophe, mécanicien à domicile. Il présente :

- 📅 **Réservation en ligne intelligente** : Sélection d'interventions avec calcul automatique de durée et redirection vers Cal.com
- 🎯 **Système de services JSON** : Base de données des interventions avec durées et prix
- 💬 **Formulaire de contact** : Communication directe avec envoi d'email automatique via Nodemailer
- 🗺️ **Carte interactive** : Visualisation de la zone d'intervention (30km autour de Salon-de-Provence)
- 💰 **Grille tarifaire dynamique** : Tarifs générés automatiquement depuis le JSON avec code couleur
- ⚖️ **Mentions légales** : Page d'informations légales obligatoires

Le site est conçu avec un focus sur :

- ⚡ **Performance** : Optimisé pour le SEO et la vitesse de chargement (Lighthouse 90+)
- 📱 **Responsive Design** : Adaptation parfaite sur mobile, tablette et desktop
- ♿ **Accessibilité** : Conforme aux standards WCAG 2.1 niveau AA
- 🎨 **Design moderne** : Interface sombre avec accents ambre/orange

Ce projet est conçu comme un **template réutilisable** pour tout professionnel souhaitant une présence en ligne rapide et efficace.

---

## ✨ Fonctionnalités

### Pages principales

| Page | Description |
|------|-------------|
| 🏠 **Accueil** | Présentation des services, statistiques, appels à l'action |
| 📅 **Réservation** | Sélection d'interventions par catégorie, calcul de durée, option "Sur mesure" avec slider |
| 📧 **Contact** | Formulaire de contact + carte Leaflet de la zone d'intervention |
| 💰 **Tarifs** | Grille tarifaire dynamique générée depuis JSON avec code couleur (vert/jaune/rouge) |
| ⚖️ **Mentions légales** | Informations légales obligatoires |
| ✅ **Confirmation** | Page de confirmation après réservation |
| 🔍 **404** | Page d'erreur personnalisée avec image et navigation |

### Fonctionnalités techniques

✅ **SEO optimisé** : Sitemap XML, balises meta, structure sémantique HTML5  
✅ **Images optimisées** : Next.js Image avec lazy loading, domaine Cloudinary autorisé  
✅ **Système de réservation intelligent** : Sélection multi-interventions, calcul automatique, redirection Cal.com  
✅ **Base de données JSON** : Services avec catégories, durées, prix et descriptions  
✅ **Tarifs dynamiques** : Génération automatique avec code couleur selon prix  
✅ **Formulaire intelligent** : Validation côté client + API Nodemailer côté serveur  
✅ **Carte interactive** : Leaflet avec cercle de 30km, chargement dynamique (SSR désactivé)  
✅ **Accessibilité** : Skip link, ARIA labels, navigation au clavier, lecteurs d'écran  
✅ **Responsive** : Menu burger mobile, grilles adaptatives, breakpoints Tailwind  
✅ **Performance** : Force-dynamic sur pages critiques, optimisation des assets

---

## 🛠️ Technologies utilisées

### Frontend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 15.5.3 | Framework React avec App Router (SSR/SSG) |
| **React** | 18.3.1 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Framework CSS utility-first |

### Intégrations & Services

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Cal.com** | 1.5.3 | Système de réservation (iframe intégré) |
| **Leaflet** | 1.9.4 | Cartes interactives OpenStreetMap |
| **React Leaflet** | 5.0.0 | Composants React pour Leaflet |
| **Nodemailer** | 7.0.6 | Envoi d'emails via Gmail SMTP |
| **Cloudinary** | - | Hébergement d'images (tarifs) |

### Outils de développement

| Outil | Description |
|-------|-------------|
| **pnpm** | Gestionnaire de paquets rapide |
| **ESLint** | Linter JavaScript/TypeScript |
| **FontAwesome** | Bibliothèque d'icônes |
| **Vercel** | Plateforme de déploiement |

---

## 🚀 Installation

### Prérequis

- Node.js 18.x ou 20.x
- pnpm (recommandé) ou npm
- Compte Gmail (pour Nodemailer)
- Compte Cloudinary (pour les images)
- Compte Cal.com (pour les réservations)

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/MJM-Coding/cam.git
cd cam
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```bash
# -----------------------------------------------------------------------------
# ! CAL.COM INTEGRATION
# -----------------------------------------------------------------------------
# URL de l'iframe Cal.com pour les réservations
# Format: https://cal.com/votre-username?theme=dark&layout=month_view&hideEventTypeDetails=false
NEXT_PUBLIC_CAL_COM_URL="https://cal.com/votre-username?theme=dark&layout=month_view&hideEventTypeDetails=false&embed=true&ui.color-scheme=dark"

# -----------------------------------------------------------------------------
# ! EMAILS (Nodemailer)
# -----------------------------------------------------------------------------
# Configuration du serveur SMTP
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_USER="contact@votre-domaine.fr"
SMTP_PASS="votre-mot-de-passe-smtp"
SMTP_FROM="Garage <contact@votre-domaine.fr>"  # adresse qui ENVOIE

# Adresse qui reçoit les mails des clients
CONTACT_RECEIVER="votre-email@exemple.fr"

# -----------------------------------------------------------------------------
# ! CLOUDINARY - Image des tarifs
# -----------------------------------------------------------------------------
# URL de l'image des tarifs hébergée sur Cloudinary
NEXT_PUBLIC_TARIFS_IMAGE=https://res.cloudinary.com/votre-cloud/image/upload/v123/tarifs.png

# Date de mise à jour des tarifs (affichée sur la page)
NEXT_PUBLIC_TARIFS_LAST_UPDATE=octobre 2025
```

⚠️ **Important** : 
- Pour SMTP avec **Hostinger**, utilisez votre mot de passe email normal
- Pour SMTP avec **Gmail**, vous devez créer un **App Password** (voir section ci-dessous)

4. **Lancer le serveur de développement**

```bash
pnpm run dev
```

Application accessible sur [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
cam/
│
├── src/
│   ├── app/                          # Pages et routes (App Router Next.js)
│   │   ├── api/
│   │   │   └── contact/route.ts      # API POST pour le formulaire
│   │   ├── data/
│   │   │   └── services.json         # Base de données des services
│   │   ├── booking/page.tsx          # Sélection interventions + Cal.com
│   │   ├── contact/page.tsx          # Formulaire + carte
│   │   ├── tarifs/page.tsx           # Tarifs dynamiques depuis JSON
│   │   ├── mentions-legales/page.tsx # Mentions légales
│   │   ├── confirmation/page.tsx     # Confirmation après réservation
│   │   ├── not-found.tsx             # Page 404 personnalisée
│   │   ├── layout.tsx                # Layout global
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
│   │   ├── MapZone.tsx               # Carte Leaflet
│   │   ├── SelectCategorie.tsx       # Sélecteur de catégorie
│   │   ├── CategoryAccordion.tsx     # Accordéon catégories
│   │   ├── ServiceCard.tsx           # Carte service
│   │   ├── WhatsappFloat.tsx         # Bouton WhatsApp flottant
│   │   ├── NeonCAM.tsx               # Logo néon animé
│   │   └── index.ts                  # Barrel export
│   │
│   ├── config/
│   │   ├── metadata.ts               # Configuration SEO
│   │   └── site.ts                   # Configuration du site
│   │
│   ├── services/
│   │   └── email.ts                  # Service Nodemailer
│   │
│   ├── utils/
│   │   └── validation.ts             # Validation des formulaires
│   │
│   └── fonts/
│       └── index.ts                  # Polices personnalisées
│
├── public/
│   └── images/
│       ├── 404/
│       │   └── 404.webp             # Image page 404
│       ├── footer/
│       │   └── CAM-blanc-reduit.webp # Logo footer
│       ├── CAM-blanc-complet.webp   # Logo principal
│       └── CAM-orange-complet.webp  # Logo orange
│
├── .env                              # Variables d'environnement (non committé)
├── package.json                      # Dépendances npm
├── next.config.ts                    # Configuration Next.js
├── tailwind.config.ts                # Configuration Tailwind
├── tsconfig.json                     # Configuration TypeScript
├── DEPLOY_DOCKER.MD                  # Guide déploiement Docker
├── GUIDE.md                          # Documentation complète
├── SERVICES_JSON.md                  # Documentation services.json
└── README.md                         # Ce fichier
```

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_NAME` | Nom du site/entreprise | `CAM` |
| `NEXT_PUBLIC_SITE_EMAIL` | Email public du site | `contact@cam.fr` |
| `NEXT_PUBLIC_SITE_PHONE` | Téléphone | `+33 6 12 34 56 78` |
| `NEXT_PUBLIC_SITE_ADDRESS` | Adresse complète | `123 Rue Example, 13000 Ville` |
| `NEXT_PUBLIC_CITY` | Ville d'intervention | `Salon-de-Provence` |
| `NEXT_PUBLIC_RAYON_INTERVENTION` | Rayon en km | `30` |
| `NEXT_PUBLIC_SIRET` | Numéro SIRET (14 chiffres) | `12345678901234` |
| `NEXT_PUBLIC_OWNER_NAME` | Nom complet du propriétaire | `Christophe Dupont` |
| `NEXT_PUBLIC_CAL_COM_URL` | URL complète de l'iframe Cal.com | `https://cal.com/username?theme=dark&embed=true` |
| `NEXT_PUBLIC_CAL_COM_USERNAME` | Username Cal.com | `votre-username` |
| `SMTP_HOST` | Serveur SMTP (Hostinger, Gmail, etc.) | `smtp.hostinger.com` |
| `SMTP_PORT` | Port SMTP (465 pour SSL, 587 pour TLS) | `465` |
| `SMTP_USER` | Identifiant SMTP (adresse email) | `contact@votre-domaine.fr` |
| `SMTP_PASS` | Mot de passe SMTP | `votre-mot-de-passe` |
| `SMTP_FROM` | Adresse d'envoi avec nom | `Garage <contact@votre-domaine.fr>` |
| `CONTACT_RECEIVER` | Destinataire des messages clients | `votre-email@exemple.fr` |
| `NEXT_PUBLIC_TARIFS_IMAGE` | URL Cloudinary de l'image des tarifs | `https://res.cloudinary.com/...` |
| `NEXT_PUBLIC_TARIFS_LAST_UPDATE` | Date de mise à jour des tarifs | `octobre 2025` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp | `33612345678` |

### Configuration Next.js (next.config.ts)

```typescript
const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"], // Autorise Cloudinary
  },
  reactStrictMode: true,
};
```

### Configuration Nodemailer

Le service email utilise **Hostinger SMTP** par défaut. Configuration :

```bash
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT=465
SMTP_USER="contact@votre-domaine.fr"
SMTP_PASS="votre-mot-de-passe-email"
```

#### Alternative : Utiliser Gmail SMTP

Si vous préférez Gmail, modifiez la configuration :

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="votre-app-password-16-caracteres"
```

⚠️ **Important pour Gmail** : Vous devez créer un **App Password** :

1. Allez sur https://myaccount.google.com/security
2. Activez la validation en 2 étapes
3. Allez dans "App Passwords" (Mots de passe des applications)
4. Générez un mot de passe pour "Mail"
5. Copiez le mot de passe à 16 caractères dans `SMTP_PASS`

---

## 🧰 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm install` | Installe les dépendances |
| `pnpm run dev` | Démarre le serveur de développement |
| `pnpm run build` | Build pour la production |
| `pnpm start` | Lance le serveur de production |
| `pnpm run lint` | Vérifie le code avec ESLint |

---

## 📦 Déploiement

### Déploiement sur Vercel (recommandé)

1. **Connecter le dépôt GitHub à Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Import Project → Sélectionnez votre repo

2. **Configurer les variables d'environnement**
   - Dans Vercel : Settings → Environment Variables
   - Ajoutez toutes les variables de `.env`

3. **Déployer**
   - Le site se déploie automatiquement à chaque push sur `main`
   - Build command : `pnpm run build`
   - Output directory : `.next`

### Configuration automatique

Vercel détecte Next.js automatiquement :
- **Node version** : 18.x ou 20.x
- **Build command** : `next build`
- **Install command** : `pnpm install`

---

## ⚡ Optimisations

### Performance

- ✅ **Next.js Image** : Optimisation automatique des images (WebP, lazy loading)
- ✅ **Force-dynamic** : Pages booking/contact/confirmation toujours fraîches
- ✅ **SSR désactivé** : Leaflet chargé uniquement côté client
- ✅ **Tailwind CSS** : CSS optimisé et purgé en production

### SEO

- ✅ **Métadonnées** : Title, description, Open Graph
- ✅ **Structure sémantique** : HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`)
- ✅ **Sitemap** : Génération automatique par Next.js
- ✅ **Attribut lang** : `lang="fr"` sur la balise `<html>`

### Accessibilité (WCAG 2.1 AA)

- ✅ **Skip link** : "Aller au contenu principal" (visible au focus)
- ✅ **ARIA labels** : Navigation, formulaires, carte
- ✅ **Navigation clavier** : Tous les éléments focusables
- ✅ **Lecteurs d'écran** : SVG décoratifs masqués, labels descriptifs

---

## 📘 Documentation

Pour une documentation complète du projet, consultez :

- **[GUIDE.md](./GUIDE.md)** : Guide complet avec architecture, maintenance, troubleshooting
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** : Détails techniques de l'architecture

Le GUIDE.md contient :
- Explication détaillée de chaque page et composant
- Configuration Cal.com, Nodemailer, Cloudinary
- Instructions de maintenance et évolutions
- Résolution de problèmes courants
- Checklist de démarrage rapide

---

## 💡 Points techniques clés

### Page Tarifs dynamique

Les tarifs sont générés automatiquement depuis `src/app/data/services.json` :
- **Code couleur automatique** : Vert (<100€), Jaune (100-300€), Rouge (>300€)
- **Layout masonry** : Colonnes qui s'adaptent pour éviter les espaces vides
- **Groupement par catégorie** : Entretien, Freinage, Distribution, etc.
- **Affichage complet** : Service, description, durée, prix
- Date de mise à jour générée automatiquement

### Système de réservation intelligent

La page booking permet de :
1. **Sélectionner une catégorie** : Entretien, Freinage, Distribution, etc.
2. **Choisir des interventions** : Sélection multiple avec durées
3. **Option "Autre / Sur mesure"** : Slider pour définir une durée personnalisée (1h à 8h)
4. **Calcul automatique** : Durée totale calculée
5. **Redirection Cal.com** : Vers l'événement correspondant (1h, 2h, 3h, etc.)
6. **Gestion des limites** : Alerte si durée > 8h avec contact direct

### Base de données JSON

Le fichier `services.json` contient tous les services :
```json
{
  "categorie": "Entretien & vidanges",
  "service": "Vidange moteur",
  "description": "huile moteur uniquement",
  "duree": 60,
  "prix": 50
}
```

Utilisé par :
- Page **booking** : Pour la sélection d'interventions
- Page **tarifs** : Pour l'affichage automatique des prix

### Carte Leaflet

- Chargée uniquement côté client (`ssr: false`) pour éviter les erreurs
- Cercle de 30km autour de Salon-de-Provence
- Accessible aux lecteurs d'écran (`role="img"`, `aria-label`)

### Formulaire de contact

- Validation côté client avec React
- API route Next.js pour l'envoi d'email
- Nodemailer avec Gmail SMTP sécurisé
- Messages de statut avec `aria-live="polite"`

### Réservation Cal.com

- **Événements multiples** : 1h, 1h30, 2h, 2h30, 3h, 4h, 5h, 6h, journée complète
- **Redirection intelligente** : Calcul de durée → événement Cal.com correspondant
- **Thème sombre** : Pour matcher le design du site
- **Redirection confirmation** : Vers `/confirmation` après paiement

### Configuration Cal.com requise

Créer les événements suivants sur Cal.com :
- `/1h` - 1 heure
- `/1h30` - 1 heure 30
- `/2h` - 2 heures
- `/2h30` - 2 heures 30
- `/3h` - 3 heures
- `/4h` - 4 heures
- `/5h` - 5 heures
- `/6h` - 6 heures
- `/journee-complete` - Journée complète (8h)

---

## 👩‍💻 Auteur

**Jessica MOSCATO** – MJM Coding  
Développeuse web freelance spécialisée en Next.js, React et TypeScript

- 🌐 Site web : [www.mjm-coding.fr](https://www.mjm-coding.fr)
- 💼 GitHub : [@MJM-Coding](https://github.com/MJM-Coding)
- 📍 Basée près de Salon-de-Provence, France

---

## 📄 Licence

Projet sous licence **MIT** – libre d'utilisation et de modification, à condition de mentionner la source.

---

## 🙏 Remerciements

- **Cal.com** pour le système de réservation
- **Cloudinary** pour l'hébergement d'images
- **Leaflet** pour les cartes interactives
- **Vercel** pour l'hébergement

---

**Dernière mise à jour** : Octobre 2025  
**Version** : 1.0.0  
**Accessibilité** : WCAG 2.1 niveau AA ♿
