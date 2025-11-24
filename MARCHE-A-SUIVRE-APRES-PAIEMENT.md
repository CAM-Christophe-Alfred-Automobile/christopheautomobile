# 📋 MARCHE À SUIVRE APRÈS PAIEMENT DU CLIENT

## ⚠️ IMPORTANT
Ce document explique **EXACTEMENT** ce qu'il faut faire une fois que le client a payé pour activer complètement le site et le référencement Google.

---

## 🎯 ÉTAPE 1 : DÉSACTIVER LA BANNIÈRE DE PAIEMENT

### 1.1 Supprimer la variable d'environnement

Ouvrir le fichier `.env` à la racine du projet et **SUPPRIMER COMPLÈTEMENT** la ligne :

```env
NEXT_PUBLIC_SHOW_PAYMENT_BANNER=true
```

> ⚠️ **Note** : Pas besoin de la mettre à `false`, on la supprime complètement car le composant sera supprimé.

### 1.2 Supprimer le composant PaymentBanner

**Fichier 1 :** `/src/app/layout.tsx`

Supprimer les lignes suivantes :

```tsx
// ⚠️ À SUPPRIMER APRÈS PAIEMENT : import PaymentBanner
import { WhatsappFloat, InstallPWA, IOSInstallPrompt, PaymentBanner } from "@/components";
```

Remplacer par :

```tsx
import { WhatsappFloat, InstallPWA, IOSInstallPrompt } from "@/components";
```

**ET** supprimer aussi :

```tsx
{/* ⚠️ À SUPPRIMER APRÈS PAIEMENT : Bannière de test */}
<PaymentBanner />
```

---

**Fichier 2 :** `/src/components/index.ts`

Supprimer les lignes suivantes :

```tsx
// ⚠️ À SUPPRIMER APRÈS PAIEMENT (voir instructions dans PaymentBanner.tsx)
export { default as PaymentBanner } from "./PaymentBanner";
```

---

**Fichier 3 :** `/src/components/PaymentBanner.tsx`

**SUPPRIMER COMPLÈTEMENT CE FICHIER** (clic droit > Supprimer)

---

## 🤖 ÉTAPE 2 : DÉBLOQUER LE RÉFÉRENCEMENT GOOGLE

### 2.1 Modifier le fichier `robots.txt`

Ouvrir le fichier `/public/robots.txt`

**SUPPRIMER TOUT LE CONTENU** et remplacer par :

```txt
User-agent: *
Allow: /

Sitemap: https://christopheautomobile.fr/sitemap.xml
```

> ⚠️ **ATTENTION** : Remplace `christopheautomobile.fr` par le vrai nom de domaine du client si différent.

---

## 🚀 ÉTAPE 3 : REDÉPLOYER LE SITE

### 3.1 Commit et push sur Git

```bash
git add .
git commit -m "✅ Activation complète après paiement - Suppression bannière + déblocage SEO"
git push
```

### 3.2 Vérifier le déploiement sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Vérifier que le déploiement est réussi (✅ Ready)
3. Tester le site : la bannière orange ne doit plus apparaître

---

## 🔍 ÉTAPE 4 : CONFIGURER GOOGLE SEARCH CONSOLE

### 4.1 Créer un compte Google Search Console

1. Aller sur : [https://search.google.com/search-console](https://search.google.com/search-console)
2. Se connecter avec un compte Google (idéalement celui du client)
3. Cliquer sur **"Ajouter une propriété"**

### 4.2 Ajouter le domaine

**Option 1 : Préfixe d'URL (recommandé)**
- Saisir : `https://christopheautomobile.fr`
- Cliquer sur **"Continuer"**

**Option 2 : Domaine complet (plus avancé)**
- Saisir : `christopheautomobile.fr`
- Nécessite une vérification DNS (plus complexe)

### 4.3 Vérifier la propriété

Google propose plusieurs méthodes. **La plus simple :**

**Méthode 1 : Balise HTML (recommandée)**

1. Google te donne une balise comme :
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXX" />
   ```

2. Ouvrir le fichier `/src/app/layout.tsx`

3. Ajouter la balise dans le `<head>` :
   ```tsx
   <head>
     {/* 🔍 Schémas JSON-LD pour le SEO */}
     <SchemaMount />
     
     {/* ✅ Vérification Google Search Console */}
     <meta name="google-site-verification" content="XXXXXXXXXX" />
   </head>
   ```

4. Redéployer le site (git commit + push)

5. Retourner sur Search Console et cliquer sur **"Vérifier"**

---

**Méthode 2 : Fichier HTML (alternative)**

1. Google te donne un fichier `googleXXXXXXXX.html`
2. Télécharger ce fichier
3. Le placer dans `/public/googleXXXXXXXX.html`
4. Redéployer le site
5. Cliquer sur **"Vérifier"**

---

### 4.4 Soumettre le sitemap

Une fois la propriété vérifiée :

1. Dans Search Console, aller dans **"Sitemaps"** (menu de gauche)
2. Saisir : `sitemap.xml`
3. Cliquer sur **"Envoyer"**

✅ Google va commencer à indexer le site dans les 24-48h.

---

### 4.5 Demander l'indexation des pages principales

Pour accélérer le processus :

1. Dans Search Console, aller dans **"Inspection de l'URL"**
2. Saisir chaque URL importante :
   - `https://christopheautomobile.fr/`
   - `https://christopheautomobile.fr/tarifs`
   - `https://christopheautomobile.fr/booking`
   - `https://christopheautomobile.fr/contact`

3. Cliquer sur **"Demander l'indexation"** pour chaque page

---

## 🏢 ÉTAPE 5 : CONFIGURER GOOGLE BUSINESS PROFILE (OPTIONNEL)

### 5.1 Créer la fiche Google Business

1. Aller sur : [https://business.google.com](https://business.google.com)
2. Cliquer sur **"Gérer maintenant"**
3. Se connecter avec le compte Google du client

### 5.2 Remplir les informations

- **Nom de l'entreprise** : Christophe AutoMobile (CAM)
- **Catégorie** : Mécanicien automobile
- **Adresse** : Salon-de-Provence (ou "Service à domicile" si pas de local)
- **Zone de service** : Rayon de 40 km autour de Salon-de-Provence
- **Téléphone** : (numéro du client)
- **Site web** : https://christopheautomobile.fr
- **Horaires** : Lundi-Samedi 08:00-19:00

### 5.3 Vérification de la fiche

Google va envoyer un code de vérification :
- Par courrier postal (si adresse physique)
- Par téléphone (si éligible)
- Par email (si domaine vérifié dans Search Console)

Une fois vérifié, la fiche apparaîtra sur Google Maps et dans les résultats de recherche locale.

---

## ✅ CHECKLIST FINALE

Avant de considérer le site comme "100% activé", vérifier que :

- [ ] La bannière orange n'apparaît plus sur le site
- [ ] Le fichier `robots.txt` autorise l'indexation (`Allow: /`)
- [ ] Le site est redéployé sur Vercel
- [ ] Google Search Console est configuré et vérifié
- [ ] Le sitemap est soumis à Google
- [ ] Les pages principales sont demandées en indexation
- [ ] (Optionnel) Google Business Profile est créé et en cours de vérification

---

## 📞 EN CAS DE PROBLÈME

Si quelque chose ne fonctionne pas :

1. Vérifier les logs de déploiement sur Vercel
2. Vérifier que le `.env` contient bien `NEXT_PUBLIC_SHOW_PAYMENT_BANNER=false`
3. Vérifier que le `robots.txt` contient bien `Allow: /`
4. Attendre 24-48h pour que Google indexe le site (c'est normal)

---

## 🎉 C'EST TERMINÉ !

Le site est maintenant **100% opérationnel** et prêt à être référencé par Google.

Le client peut commencer à recevoir des visiteurs organiques dans les prochains jours/semaines.

**Bon référencement ! 🚀**
