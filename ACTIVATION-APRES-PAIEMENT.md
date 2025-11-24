# ✅ ACTIVATION COMPLÈTE APRÈS PAIEMENT

## 🎯 OBJECTIF
Activer toutes les fonctionnalités du site une fois le client payé.

---

## 📋 ÉTAPE 1 : SUPPRIMER LE CODE DE BLOCAGE

### Fichier 1 : `/src/app/booking/page.tsx`

**Supprimer l'import :**
```tsx
import { useRouter } from "next/navigation"; // ⚠️ À SUPPRIMER APRÈS PAIEMENT
```

**Supprimer tout le bloc entre les commentaires :**
```tsx
// ⚠️ BLOCAGE AVANT PAIEMENT - DÉBUT DU BLOC À SUPPRIMER ⚠️
...
// ⚠️ BLOCAGE AVANT PAIEMENT - FIN DU BLOC À SUPPRIMER ⚠️
```

---

### Fichier 2 : `/src/components/whatsapp/WhatsappFloat.tsx`

**Supprimer tout le bloc entre les commentaires :**
```tsx
// ⚠️ BLOCAGE AVANT PAIEMENT - DÉBUT DU BLOC À SUPPRIMER ⚠️
...
// ⚠️ BLOCAGE AVANT PAIEMENT - FIN DU BLOC À SUPPRIMER ⚠️
```

---

### Fichier 3 : Supprimer la bannière

Suivre les instructions dans `/src/components/banner/PaymentBanner.tsx`

---

### Fichier 4 : Supprimer la variable `.env`

**Supprimer complètement la ligne :**
```env
NEXT_PUBLIC_SHOW_PAYMENT_BANNER=true
```

---

## ✅ CE QUI SERA AUTOMATIQUEMENT ACTIVÉ

### 1. **Bannière orange supprimée**
- ❌ Plus de message "Site en cours de finalisation"

### 2. **Page /booking accessible**
- ✅ Réservation en ligne fonctionnelle
- ✅ Calendrier Cal.com visible

### 3. **WhatsApp flottant activé**
- ✅ Bouton vert en bas à droite
- ✅ Contact direct disponible

---

## 🤖 ÉTAPE 2 : DÉBLOQUER GOOGLE (SEO)

### Modifier le fichier `public/robots.txt`

**SUPPRIMER tout le contenu** et remplacer par :

```txt
User-agent: *
Allow: /

Sitemap: https://christopheautomobile.fr/sitemap.xml
```

> ⚠️ Remplace `christopheautomobile.fr` par le vrai domaine si différent.

---

## 🚀 ÉTAPE 3 : REDÉPLOYER

### Via Git + Vercel

```bash
git add .
git commit -m "✅ Activation complète - Client payé"
git push
```

Vercel redéploiera automatiquement.

---

## 🔍 ÉTAPE 4 : GOOGLE SEARCH CONSOLE

### 4.1 Ajouter la propriété

1. Aller sur : https://search.google.com/search-console
2. Cliquer sur **"Ajouter une propriété"**
3. Saisir : `https://christopheautomobile.fr`

### 4.2 Vérifier la propriété

**Méthode recommandée : Balise HTML**

1. Google te donne une balise :
   ```html
   <meta name="google-site-verification" content="XXXXXXXXXX" />
   ```

2. Ouvrir `/src/app/layout.tsx`

3. Ajouter dans le `<head>` :
   ```tsx
   <head>
     <SchemaMount />
     
     {/* ✅ Vérification Google Search Console */}
     <meta name="google-site-verification" content="XXXXXXXXXX" />
   </head>
   ```

4. Redéployer (git commit + push)

5. Cliquer sur **"Vérifier"** dans Search Console

### 4.3 Soumettre le sitemap

1. Dans Search Console → **"Sitemaps"**
2. Saisir : `sitemap.xml`
3. Cliquer sur **"Envoyer"**

✅ Google indexera le site sous 24-48h

---

## 🏢 ÉTAPE 5 : GOOGLE BUSINESS (OPTIONNEL)

### Créer la fiche

1. Aller sur : https://business.google.com
2. Cliquer sur **"Gérer maintenant"**
3. Remplir :
   - **Nom** : Christophe AutoMobile (CAM)
   - **Catégorie** : Mécanicien automobile
   - **Zone de service** : 40 km autour de Salon-de-Provence
   - **Téléphone** : (numéro du client)
   - **Site web** : https://christopheautomobile.fr
   - **Horaires** : Lundi-Samedi 08:00-19:00

4. Vérifier la fiche (par courrier, téléphone ou email)

---

## ✅ CHECKLIST FINALE

Avant de considérer le site comme "100% activé" :

- [ ] `.env` : `NEXT_PUBLIC_SHOW_PAYMENT_BANNER=false`
- [ ] `robots.txt` : `Allow: /`
- [ ] Site redéployé sur Vercel
- [ ] Bannière orange disparue
- [ ] Page `/booking` accessible
- [ ] WhatsApp flottant visible
- [ ] Google Search Console configuré
- [ ] Sitemap soumis à Google
- [ ] (Optionnel) Google Business créé

---

## 🎉 C'EST TERMINÉ !

Le site est maintenant **100% opérationnel** et prêt à recevoir des clients.

**Bon référencement ! 🚀**
