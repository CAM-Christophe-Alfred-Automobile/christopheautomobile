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
- 🎯 **Système de services JSON** : Base de données des interventions avec durées et prix, tri automatique et filtrage intelligent
- 💬 **Formulaire de contact** : Communication directe avec envoi d'email automatique via Nodemailer
- 🗺️ **Carte interactive** : Visualisation de la zone d'intervention (30km autour de Salon-de-Provence)
- 💰 **Grille tarifaire dynamique** : Tarifs générés automatiquement depuis le JSON avec code couleur et recherche en temps réel
- ⚖️ **Mentions légales** : Page d'informations légales obligatoires
- 📱 **PWA Ready** : Installation possible sur mobile et desktop, fonctionne hors ligne

Le site est conçu avec un focus sur :

- ⚡ **Performance** : Optimisé pour le SEO et la vitesse de chargement (Lighthouse 95+)
- 🔍 **SEO avancé** : Sitemap XML, métadonnées optimisées, structured data Schema.org
- 📱 **Responsive Design** : Adaptation parfaite sur mobile, tablette et desktop
- ♿ **Accessibilité** : Conforme aux standards WCAG 2.1 niveau AA
- 🎨 **Design moderne** : Interface sombre avec accents ambre/orange
- 🔒 **Sécurisé** : HTTPS, variables d'environnement protégées, validation des formulaires

Ce projet est conçu comme un **template réutilisable** pour tout professionnel souhaitant une présence en ligne rapide et efficace.

---

## ✨ Fonctionnalités

### Pages principales

| Page | Description |
|------|-------------|
| 🏠 **Accueil** | Présentation des services, statistiques, appels à l'action |
| 📅 **Réservation** | Double mode : recherche directe OU navigation par catégorie, calcul automatique de durée |
| 📧 **Contact** | Formulaire de contact + carte Leaflet de la zone d'intervention |
| 💰 **Tarifs** | Grille tarifaire dynamique générée depuis JSON avec code couleur (vert/orange/rouge/gris) |
| ⚖️ **Mentions légales** | Informations légales obligatoires |
| ✅ **Confirmation** | Page de confirmation après réservation |
| 🔍 **404** | Page d'erreur personnalisée avec image et navigation |

### Fonctionnalités techniques

✅ **SEO optimisé** : Sitemap XML, balises meta, structured data Schema.org, Open Graph  
✅ **PWA iOS/Android** : Installation native avec prompts spécifiques iOS (Safari) et Android (Chrome)  
✅ **Images optimisées** : Next.js Image avec lazy loading, formats WebP, attribut sizes responsive  
✅ **Double mode de recherche** : Recherche directe OU navigation par catégorie pour tous types d'utilisateurs  
✅ **Base de données JSON** : 100+ services avec tri automatique par durée, code couleur intelligent  
✅ **Tarifs dynamiques** : Génération automatique avec recherche en temps réel, accordéons, code couleur  
✅ **Formulaire intelligent** : Validation côté client + API Nodemailer côté serveur  
✅ **Carte interactive** : Leaflet avec cercle de 30km, chargement dynamique (SSR désactivé)  
✅ **Accessibilité** : Skip link, ARIA labels, navigation au clavier, lecteurs d'écran  
✅ **Mobile-First** : Bouton "Réserver" toujours visible sur mobile, menu burger optimisé  
✅ **Performance** : Lighthouse 95+, optimisation des assets, code splitting, lazy loading

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
| **Nodemailer** | 7.0.6 | Envoi d'emails via SMTP |

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

```

⚠️ **Important** : 
- Pour SMTP avec **Hostinger**, utilisez votre mot de passe email normal
- Pour SMTP avec **Gmail**, vous devez créer un **App Password** (voir section ci-dessous)
- Les tarifs sont générés dynamiquement depuis le fichier JSON, pas d'image externe

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
├── env.example                       # Template des variables d'environnement
├── package.json                      # Dépendances npm
├── next.config.ts                    # Configuration Next.js
├── tailwind.config.ts                # Configuration Tailwind
├── tsconfig.json                     # Configuration TypeScript
├── GUIDE.md                          # Documentation complète pour maintenance
└── README.md                         # Ce fichier
```

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SITE_NAME` | Nom du site/entreprise | `CAM` |
| `NEXT_PUBLIC_SITE_EMAIL` | Email public du site | `contact@cam.fr` |
| `NEXT_PUBLIC_SITE_PHONE` | Téléphone | `+33 6 00 00 00 00` |
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
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp (format international) | `33600000000` |
| `NEXT_PUBLIC_AUTODOC_REF_CODE` | Code parrainage Autodoc | `votre-code` |
| `NEXT_PUBLIC_AUTODOC_REF_URL` | URL Autodoc | `https://www.auto-doc.fr/` |

### Configuration Next.js (next.config.ts)

```typescript
const nextConfig: NextConfig = {
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
   - Ajoutez toutes les variables de `env.example`
   - ⚠️ **Important** : Ne PAS ajouter `PORT` ou `NODE_ENV` (Vercel les gère automatiquement)

3. **Déployer**
   - Le site se déploie automatiquement à chaque push sur `main`
   - Build command : `pnpm run build`
   - Output directory : `.next`

### Configuration automatique

Vercel détecte Next.js automatiquement :
- **Node version** : 18.x ou 20.x
- **Build command** : `next build`
- **Install command** : `pnpm install`
- **Environment** : Production (automatique)
- **Port** : Géré automatiquement par Vercel

---

## ⚡ Optimisations

### Performance

- ✅ **Next.js Image** : Optimisation automatique (WebP/AVIF, lazy loading, responsive)
- ✅ **Code splitting** : Chargement progressif des composants
- ✅ **SSR désactivé** : Leaflet et modales chargés côté client uniquement
- ✅ **Tailwind CSS** : CSS optimisé et purgé en production
- ✅ **Fonts locales** : Pas de requêtes externes Google Fonts
- ✅ **useMemo/useCallback** : Optimisation des re-renders React

### SEO Avancé

#### Métadonnées complètes
- ✅ **Title & Description** : Optimisés pour chaque page
- ✅ **Open Graph** : Partage sur réseaux sociaux (Facebook, Twitter)
- ✅ **Canonical URLs** : Évite le duplicate content
- ✅ **Attribut lang** : `lang="fr"` sur `<html>`

#### Structure et indexation
- ✅ **Sitemap XML** : `/sitemap.xml` généré automatiquement
- ✅ **Robots.txt** : `/robots.txt` pour les crawlers
- ✅ **Structure sémantique** : HTML5 (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`)
- ✅ **Headings hiérarchiques** : H1 → H2 → H3 respectés

#### Schema.org (Structured Data)
- ✅ **LocalBusiness** : Informations du garage (nom, adresse, téléphone)
- ✅ **Service** : Liste des prestations avec prix
- ✅ **Organization** : Identité de l'entreprise
- ✅ **BreadcrumbList** : Fil d'Ariane

#### Performance SEO
- ✅ **Core Web Vitals** : LCP, FID, CLS optimisés
- ✅ **Lighthouse Score** : 95+ sur toutes les pages
- ✅ **Mobile-First** : Indexation mobile prioritaire

### PWA (Progressive Web App)

#### Manifest Web App
```json
{
  "name": "CAM - Mécanicien à Domicile",
  "short_name": "CAM",
  "theme_color": "#F59E0B",
  "background_color": "#111827",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Fonctionnalités PWA
- ✅ **Installation native** : Prompts personnalisés iOS (Safari) et Android (Chrome)
- ✅ **Détection intelligente** : Message spécifique si l'utilisateur est sur Chrome iOS (redirection vers Safari)
- ✅ **Mode standalone** : Fonctionne comme une app native
- ✅ **Icônes adaptatives** : 192x192 et 512x512
- ✅ **Theme color** : Barre d'adresse colorée sur mobile
- ✅ **Mode hors ligne** : Service worker pour cache basique
- ✅ **LocalStorage** : Mémorisation du refus pendant 7 jours

#### Avantages pour l'utilisateur
- 📱 **Installation rapide** : Un clic pour ajouter à l'écran d'accueil
- 🚀 **Chargement instantané** : Cache des ressources statiques
- 📶 **Hors ligne** : Accès aux pages visitées même sans connexion
- 🔔 **Notifications push** : Possibilité d'ajouter des notifications (futur)

### Accessibilité (WCAG 2.1 AA)

- ✅ **Skip link** : "Aller au contenu principal" (visible au focus)
- ✅ **ARIA labels** : Navigation, formulaires, carte, modales
- ✅ **Navigation clavier** : Tous les éléments interactifs focusables
- ✅ **Lecteurs d'écran** : SVG décoratifs masqués, labels descriptifs
- ✅ **Contraste** : Ratios de contraste conformes (4.5:1 minimum)
- ✅ **Focus visible** : Outline sur tous les éléments interactifs
- ✅ **Messages dynamiques** : `aria-live="polite"` pour les notifications

---

## 📘 Documentation

Pour une documentation complète du projet, consultez :

- **[GUIDE.md](./GUIDE.md)** : Guide complet avec architecture, maintenance, troubleshooting

Le GUIDE.md contient :
- Explication détaillée de chaque page et composant
- Configuration Cal.com, Nodemailer
- Instructions de maintenance et évolutions
- Résolution de problèmes courants
- Checklist de démarrage rapide

---

## 💡 Points techniques clés

### 📋 Système de gestion des interventions (services.json)

#### Structure d'une intervention

```json
{
  "categorie": "Moteur",
  "service": "Vidange moteur",
  "description": "Huile moteur uniquement",
  "duree": 35,
  "prix": 30
}
```

#### Logique des durées et réservabilité

| Type de durée | Valeur | Affichage | Réservable ? | Usage |
|--------------|--------|-----------|--------------|-------|
| **Durée fixe** | `120` (nombre) | `⏱ 2h` | ✅ Oui | Intervention standardisée |
| **Sur devis** | `null` | `⏱ Sur devis` | ❌ Non | Dépend du véhicule/diagnostic |
| **Variable** | `"Variable"` | `⏱ Variable` | ❌ Non | Durée imprévisible |

**Règle importante** : Seules les interventions avec une **durée numérique** sont réservables sur la page booking.

#### Logique des prix

| Type de prix | Valeur | Affichage | Exemple d'usage |
|-------------|--------|-----------|------------------|
| **Prix fixe** | `30` (nombre) | `30€` | Prix standard connu |
| **Prix minimum** | `"À partir de 60€"` | `À partir de 60€` | Prix variable selon véhicule |
| **Sur devis** | `null` | `Sur devis` | Prix totalement variable |

**Note** : Le prix n'affecte PAS la réservabilité. Une intervention avec `prix: null` mais `duree: 120` reste réservable.

#### Code couleur automatique (basé sur la durée)

| Couleur | Durée | Badge | Usage |
|---------|-------|-------|-------|
| 🟢 **Vert** | ≤ 2h30 (150 min) | Bordure + badge verts | Interventions rapides |
| 🟠 **Orange** | 2h30 - 3h30 (150-210 min) | Bordure + badge oranges | Interventions moyennes |
| 🔴 **Rouge** | > 3h30 (210 min) | Bordure + badge rouges | Interventions longues |
| ⚪ **Gris** | `null` ou non numérique | Bordure + badge gris | Sur devis / Variable |

#### Tri automatique

Les interventions sont automatiquement triées par **durée croissante** dans chaque catégorie :
1. Interventions rapides en premier (30 min, 45 min, 60 min...)
2. Interventions longues ensuite
3. Interventions "Sur devis" en dernier

#### Exemples pratiques

**Intervention réservable avec prix variable :**
```json
{
  "service": "Pompe à injection",
  "duree": 240,  // ✅ Réservable (durée connue)
  "prix": "À partir de 100€"  // Prix varie selon modèle
}
```

**Intervention sur devis (non réservable) :**
```json
{
  "service": "Capteur PMH",
  "duree": null,  // ❌ Non réservable
  "prix": "À partir de 35€"  // Peut quand même indiquer un prix minimum
}
```

**Intervention standard (réservable) :**
```json
{
  "service": "Vidange moteur",
  "duree": 35,  // ✅ Réservable
  "prix": 30  // Prix fixe
}
```

### Page Tarifs dynamique

Les tarifs sont générés automatiquement depuis `src/app/data/services.json` :
- **Recherche en temps réel** : Filtre par nom, catégorie ou description
- **Code couleur intelligent** : Basé sur la durée (vert/orange/rouge/gris)
- **Tri automatique** : Par durée croissante dans chaque catégorie
- **Accordéons** : Catégories repliables avec compteur d'interventions
- **Layout colonnes** : 2 colonnes sur desktop, 1 sur mobile
- **Bouton "Tout ouvrir/fermer"** : Contrôle global des accordéons
- Affichage complet : Service, description, durée, prix
- Date de mise à jour générée automatiquement

### Système de réservation intelligent

La page booking offre **deux modes de navigation** :

#### Mode 1 : Recherche directe
- Barre de recherche globale (nom, description, catégorie)
- Idéal pour les utilisateurs qui savent ce qu'ils cherchent
- Résultats filtrés en temps réel
- Tri automatique par durée croissante

#### Mode 2 : Navigation par catégorie
- Sélection d'une catégorie (Entretien, Freinage, Moteur, etc.)
- Affichage des interventions de cette catégorie
- Sélection multiple avec code couleur
- Option "Autre / Sur mesure" avec slider (1h à 8h)

#### Fonctionnalités communes
1. **Filtrage automatique** : Seules les interventions avec durée numérique sont réservables
2. **Calcul automatique** : Durée totale calculée en temps réel
3. **Redirection Cal.com** : Vers l'événement correspondant (1h, 1h30, 2h, etc.)
4. **Gestion des limites** : Alerte si durée > 8h avec redirection vers contact
5. **Mobile-First** : Bouton "Réserver" toujours visible dans le header mobile

**Règle de filtrage** : Les interventions avec `duree: null` ou `duree: "Variable"` n'apparaissent pas dans le booking (client doit contacter directement).

### Base de données JSON

Le fichier `services.json` contient tous les services :
```json
{
  "categorie": "Entretien",
  "service": "Vidange moteur",
  "description": "huile moteur uniquement",
  "duree": 35,
  "prix": 30
}
```

Utilisé par :
- Page **booking** : Filtrage et sélection des interventions réservables
- Page **tarifs** : Affichage complet avec recherche, tri et code couleur

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
- **Leaflet** pour les cartes interactives
- **Vercel** pour l'hébergement

---

**Dernière mise à jour** : Novembre 2025  
**Version** : 1.0.0  
**Accessibilité** : WCAG 2.1 niveau AA ♿  
**Déploiement** : Vercel (Production)
