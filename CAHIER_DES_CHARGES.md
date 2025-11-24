# CAHIER DES CHARGES

## Site Web - Christophe Auto-Mobile

---

**Client :** [Nom du client]  
**Prestataire :** Christophe Auto-Mobile  
**Date :** 23 octobre 2025  
**Version :** 1.0

---

## SOMMAIRE

1. [Présentation du projet](#1-présentation-du-projet)
2. [Description des besoins](#2-description-des-besoins)
3. [Spécifications fonctionnelles](#3-spécifications-fonctionnelles)
4. [Spécifications techniques](#4-spécifications-techniques)
5. [Design et ergonomie](#5-design-et-ergonomie)
6. [Contraintes](#6-contraintes)
7. [Livrables](#7-livrables)
8. [Planning prévisionnel](#8-planning-prévisionnel)
9. [Maintenance et support](#9-maintenance-et-support)
10. [Annexes](#10-annexes)

---

## 1. PRÉSENTATION DU PROJET

### 1.1 Contexte

Christophe Auto-Mobile est un service de mécanique automobile à domicile proposant des interventions de qualité directement chez le client. Le projet vise à créer un site web moderne permettant aux clients de découvrir les services, obtenir des devis et réserver des interventions en ligne.

### 1.2 Objectifs

- **Visibilité** : Présenter l'activité et les services proposés
- **Conversion** : Faciliter la prise de contact et la réservation
- **Automatisation** : Permettre la réservation en ligne avec calcul automatique de durée
- **Professionnalisme** : Véhiculer une image moderne et de confiance

### 1.3 Périmètre

**Inclus :**
- Site web responsive (mobile, tablette, desktop)
- Système de réservation en ligne intégré
- Catalogue de services avec tarifs
- Formulaire de contact
- Intégration WhatsApp
- Optimisation SEO de base

**Exclu :**
- Application mobile native
- Système de paiement en ligne
- Espace client avec historique
- Blog / actualités

---

## 2. DESCRIPTION DES BESOINS

### 2.1 Besoins fonctionnels

#### Pages principales
1. **Page d'accueil** : Présentation de l'activité, services phares, appels à l'action
2. **Page Services** : Catalogue complet des prestations avec tarifs et durées
3. **Page Réservation** : Système de réservation en ligne avec calendrier
4. **Page Contact** : Formulaire de contact et coordonnées
5. **Page À propos** : Présentation de Christophe et de son expertise

#### Fonctionnalités clés
- **Sélection de services** : Interface intuitive pour choisir une ou plusieurs prestations
- **Calcul automatique** : Durée et estimation tarifaire en temps réel
- **Réservation en ligne** : Intégration Cal.com pour la prise de rendez-vous
- **Contact rapide** : Bouton WhatsApp flottant pour contact immédiat
- **Responsive design** : Adaptation parfaite sur tous les écrans

### 2.2 Besoins techniques

- **Framework** : Next.js 15 (React)
- **Styling** : TailwindCSS pour un design moderne
- **Hébergement** : Vercel ou Netlify (déploiement automatique)
- **Performance** : Temps de chargement < 3 secondes
- **SEO** : Optimisation pour les moteurs de recherche
- **Accessibilité** : Conformité WCAG niveau AA

### 2.3 Besoins graphiques

- **Identité visuelle** : Couleurs professionnelles (noir, orange/ambre, blanc)
- **Typographie** : Police moderne et lisible
- **Images** : Photos de qualité des interventions
- **Icônes** : Icônes claires pour chaque service
- **Animations** : Transitions fluides et modernes

---

## 3. SPÉCIFICATIONS FONCTIONNELLES

### 3.1 Page d'accueil

**Éléments :**
- Hero section avec titre accrocheur et CTA
- Présentation des services principaux (3-4 cartes)
- Section "Pourquoi nous choisir ?"
- Témoignages clients
- Appel à l'action vers la réservation
- Footer avec mentions légales et liens

### 3.2 Page Services

**Catégories de services :**
1. Entretien (vidange, filtres, etc.)
2. Freinage (plaquettes, disques, liquide)
3. Pneumatiques (montage, équilibrage, permutation)
4. Électricité (batterie, alternateur, démarreur)
5. Distribution (courroie, chaîne, galet)
6. Climatisation (recharge, diagnostic)
7. Carrosserie (réparation, polissage)
8. Diagnostic (valise, contrôle)
9. Autre / Sur mesure

**Pour chaque service :**
- Nom du service
- Description courte
- Durée estimée
- Tarif indicatif
- Bouton "Ajouter à ma réservation"

### 3.3 Page Réservation

**Processus :**
1. **Sélection de catégorie** : Dropdown avec toutes les catégories
2. **Choix des services** : Liste des services de la catégorie avec checkbox
3. **Calcul automatique** : Affichage de la durée totale estimée
4. **Calendrier** : Iframe Cal.com avec créneaux disponibles
5. **Formulaire** : Coordonnées client et détails du véhicule
6. **Confirmation** : Email de confirmation automatique

**Règles métier :**
- Maximum 8h par intervention (1 journée)
- Au-delà : redirection vers contact direct
- Durée personnalisable pour "Autre / Sur mesure"

### 3.4 Page Contact

**Éléments :**
- Formulaire de contact (nom, email, téléphone, message)
- Coordonnées (téléphone, email)
- Zone d'intervention
- Horaires d'ouverture
- Bouton WhatsApp

---

## 4. SPÉCIFICATIONS TECHNIQUES

### 4.1 Architecture

```
/
├── app/
│   ├── page.tsx (Accueil)
│   ├── services/
│   │   └── page.tsx
│   ├── booking/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   └── data/
│       └── services.json
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ServiceCard.tsx
│   ├── SelectCategorie.tsx
│   └── Whatsapp.tsx
└── public/
    └── images/
```

### 4.2 Technologies utilisées

- **Frontend** : Next.js 15, React 18, TypeScript
- **Styling** : TailwindCSS, CSS Modules
- **Réservation** : Cal.com (iframe intégration)
- **Contact** : WhatsApp Business API
- **Déploiement** : Vercel / Netlify
- **Versioning** : Git / GitHub

### 4.3 Données

**Fichier services.json :**
```json
{
  "categorie": "Entretien",
  "service": "Vidange moteur seule",
  "description": "huile moteur uniquement",
  "duree": 60,
  "prix": 30
}
```

### 4.4 Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge (2 dernières versions)
- **Appareils** : Desktop, tablette, mobile
- **Résolutions** : 320px à 2560px

---

## 5. DESIGN ET ERGONOMIE

### 5.1 Charte graphique

**Couleurs principales :**
- Noir : `#1a1a1a` (fond)
- Orange/Ambre : `#f59e0b` (CTA, accents)
- Gris : `#374151` (textes secondaires)
- Blanc : `#ffffff` (textes principaux)

**Typographie :**
- Titres : Font bold, grande taille
- Textes : Font regular, lisible
- Boutons : Font semibold

### 5.2 Principes UX

- **Clarté** : Navigation intuitive et évidente
- **Rapidité** : Accès rapide aux informations clés
- **Confiance** : Design professionnel et rassurant
- **Mobile-first** : Optimisation prioritaire pour mobile
- **Accessibilité** : Contrastes suffisants, textes alternatifs

### 5.3 Responsive

- **Mobile** : < 768px (navigation hamburger, layout vertical)
- **Tablette** : 768px - 1024px (layout adapté)
- **Desktop** : > 1024px (layout complet)

---

## 6. CONTRAINTES

### 6.1 Contraintes techniques

- Temps de chargement < 3 secondes
- Score Lighthouse > 90/100
- Compatible HTTPS obligatoire
- Optimisation images (WebP, lazy loading)

### 6.2 Contraintes de délai

- **Phase 1** : Conception et maquettes (1 semaine)
- **Phase 2** : Développement (2-3 semaines)
- **Phase 3** : Tests et corrections (1 semaine)
- **Phase 4** : Mise en production (2-3 jours)

**Durée totale estimée :** 4-6 semaines

### 6.3 Contraintes budgétaires

À définir selon le périmètre final et les besoins spécifiques.

### 6.4 Contraintes légales

- Mentions légales obligatoires
- Politique de confidentialité (RGPD)
- Cookies (si applicable)
- CGV/CGU

---

## 7. LIVRABLES

### 7.1 Livrables techniques

- ✅ Code source complet (GitHub)
- ✅ Site web déployé et fonctionnel
- ✅ Documentation technique
- ✅ Guide d'utilisation administrateur
- ✅ Fichier de configuration Cal.com

### 7.2 Livrables graphiques

- ✅ Maquettes desktop/mobile (si demandé)
- ✅ Charte graphique
- ✅ Assets (logos, icônes, images)

### 7.3 Livrables documentaires

- ✅ Documentation utilisateur
- ✅ Guide de mise à jour des services
- ✅ Procédure de sauvegarde

---

## 8. PLANNING PRÉVISIONNEL

### Phase 1 : Conception (Semaine 1)
- Validation du cahier des charges
- Création des maquettes (optionnel)
- Validation de la charte graphique

### Phase 2 : Développement (Semaines 2-4)
- Mise en place de l'architecture
- Développement des pages
- Intégration Cal.com et WhatsApp
- Création du catalogue de services

### Phase 3 : Tests (Semaine 5)
- Tests fonctionnels
- Tests responsive
- Tests de performance
- Corrections et ajustements

### Phase 4 : Mise en production (Semaine 6)
- Déploiement sur serveur de production
- Configuration DNS
- Tests en production
- Formation client

---

## 9. MAINTENANCE ET SUPPORT

### 9.1 Garantie

- **Durée** : 3 mois après mise en production
- **Couverture** : Bugs et dysfonctionnements
- **Exclusions** : Modifications du cahier des charges

### 9.2 Support technique

- **Disponibilité** : Email et téléphone
- **Délai de réponse** : 48h ouvrées
- **Interventions** : Corrections de bugs incluses

### 9.3 Évolutions futures

**Possibilités d'évolution :**
- Système de paiement en ligne
- Espace client avec historique
- Blog / actualités
- Système de fidélité
- Application mobile
- Gestion de stock de pièces

---

## 10. ANNEXES

### 10.1 Arborescence du site

```
Accueil
├── Services
├── Réservation
├── À propos
└── Contact
```

### 10.2 Liste complète des services

Voir fichier `services.json` pour la liste exhaustive des 150+ services proposés.

### 10.3 Exemples de sites inspirants

- [À compléter selon vos références]

### 10.4 Coordonnées

**Client :**
- Nom : [À compléter]
- Email : [À compléter]
- Téléphone : [À compléter]

**Prestataire :**
- Nom : Christophe Auto-Mobile
- Email : [À compléter]
- Téléphone : [À compléter]

---

## VALIDATION

**Client :**
- Nom et signature : ___________________
- Date : ___________________

**Prestataire :**
- Nom et signature : ___________________
- Date : ___________________

---

*Document confidentiel - Tous droits réservés*
