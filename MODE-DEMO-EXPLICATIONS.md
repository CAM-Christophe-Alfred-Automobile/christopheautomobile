# 🔒 MODE DÉMO - EXPLICATIONS

## 🎯 OBJECTIF

Bloquer certaines fonctionnalités du site **AVANT le paiement du client**, tout en gardant le site consultable.

---

## ✅ CE QUI EST BLOQUÉ (MODE DÉMO ACTIF)

### 1. **Bannière orange en haut**
```
🚧 Site en cours de finalisation - version de démonstration
```

### 2. **Page /booking bloquée**
Au lieu du formulaire de réservation, affichage d'un message :
```
🚧 Réservation temporairement désactivée

Le système de réservation en ligne sera disponible très prochainement.

En attendant, vous pouvez consulter nos tarifs et nous contacter directement.

[📋 Voir les tarifs] [📞 Nous contacter]
```

### 3. **WhatsApp flottant désactivé**
- ❌ Pas de bouton vert en bas à droite
- ✅ Le client peut toujours contacter via `/contact`

---

## ✅ CE QUI RESTE ACCESSIBLE

### Pages consultables :
- ✅ **/** (Page d'accueil)
- ✅ **/tarifs** (Liste complète des prestations)
- ✅ **/contact** (Formulaire de contact)
- ✅ **/mentions-legales**

### Fonctionnalités actives :
- ✅ Navigation complète
- ✅ Consultation des tarifs
- ✅ Formulaire de contact
- ✅ Design et animations

---

## 🔧 COMMENT ÇA FONCTIONNE ?

### Une seule variable contrôle tout

**Fichier `.env` :**
```env
NEXT_PUBLIC_SHOW_PAYMENT_BANNER=true
```

Cette variable active/désactive :
1. La bannière orange (`PaymentBanner.tsx`)
2. Le blocage de `/booking` (`booking/page.tsx`)
3. Le bouton WhatsApp flottant (`WhatsappFloat.tsx`)

---

## 🚀 ACTIVATION APRÈS PAIEMENT

### Étape 1 : Modifier le .env

```env
NEXT_PUBLIC_SHOW_PAYMENT_BANNER=false
```

### Étape 2 : Redéployer

```bash
git add .
git commit -m "✅ Activation complète"
git push
```

**C'EST TOUT !** 🎉

Tout se réactive automatiquement :
- ✅ Bannière disparue
- ✅ `/booking` accessible
- ✅ WhatsApp flottant visible

---

## 📁 FICHIERS MODIFIÉS

### 1. `/src/components/banner/PaymentBanner.tsx`
```tsx
const showBanner = process.env.NEXT_PUBLIC_SHOW_PAYMENT_BANNER === "true";
if (!showBanner) return null;
```

### 2. `/src/app/booking/page.tsx`
```tsx
const isDemoMode = process.env.NEXT_PUBLIC_SHOW_PAYMENT_BANNER === "true";

if (isDemoMode) {
  return (
    // Message de blocage
  );
}
```

### 3. `/src/components/whatsapp/WhatsappFloat.tsx`
```tsx
const isDemoMode = process.env.NEXT_PUBLIC_SHOW_PAYMENT_BANNER === "true";

if (isDemoMode) {
  return null; // Pas de bouton WhatsApp
}
```

---

## 🧪 COMMENT TESTER

### Test en local

1. **Mode démo activé** (`.env` : `true`)
   ```bash
   pnpm dev
   ```
   - Vérifier la bannière orange
   - Aller sur `/booking` → Message de blocage
   - Pas de bouton WhatsApp

2. **Mode production activé** (`.env` : `false`)
   ```bash
   pnpm dev
   ```
   - Pas de bannière
   - `/booking` accessible
   - Bouton WhatsApp visible

---

## 💡 AVANTAGES DE CETTE APPROCHE

### 1. **Ultra-simple**
- ✅ 1 seule variable à changer
- ✅ Pas de code à supprimer
- ✅ Pas de fichiers à modifier

### 2. **Réversible**
- ✅ Retour en mode démo possible (si besoin)
- ✅ Pas de risque de casser le site

### 3. **Propre**
- ✅ Pas de code commenté
- ✅ Logique centralisée
- ✅ Facile à maintenir

### 4. **Sécurisé**
- ✅ Impossible de réserver par erreur
- ✅ Pas de contact WhatsApp non souhaité
- ✅ Site consultable mais non fonctionnel

---

## 📊 COMPARAISON AVANT/APRÈS

| Fonctionnalité | Mode Démo (`true`) | Mode Production (`false`) |
|----------------|-------------------|--------------------------|
| Bannière orange | ✅ Visible | ❌ Cachée |
| Page `/booking` | ❌ Bloquée | ✅ Accessible |
| WhatsApp flottant | ❌ Désactivé | ✅ Actif |
| Page `/tarifs` | ✅ Accessible | ✅ Accessible |
| Page `/contact` | ✅ Accessible | ✅ Accessible |
| SEO Google | ❌ Bloqué (`robots.txt`) | ✅ Actif |

---

## 🎯 CONCLUSION

Cette approche est **idéale** pour :
- ✅ Montrer le site au client
- ✅ Éviter les réservations avant paiement
- ✅ Garder le contrôle
- ✅ Activation rapide (1 variable)

**Dernière mise à jour** : 24 novembre 2025
