# ⚡ GUIDE RAPIDE - ACTIVATION APRÈS PAIEMENT

## 🎯 3 FICHIERS À MODIFIER

### 1️⃣ `/src/app/booking/page.tsx`

**Supprimer ces lignes :**

```tsx
import { useRouter } from "next/navigation"; // ⚠️ À SUPPRIMER APRÈS PAIEMENT
```

**ET supprimer tout le bloc :**

```tsx
// ⚠️ BLOCAGE AVANT PAIEMENT - DÉBUT DU BLOC À SUPPRIMER ⚠️
  const router = useRouter();
  const isDemoMode = process.env.NEXT_PUBLIC_SHOW_PAYMENT_BANNER === "true";
  
  if (isDemoMode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-[#0F0F0F] to-gray-900 text-white">
        ...tout le contenu...
      </div>
    );
  }
// ⚠️ BLOCAGE AVANT PAIEMENT - FIN DU BLOC À SUPPRIMER ⚠️
```

---

### 2️⃣ `/src/components/whatsapp/WhatsappFloat.tsx`

**Supprimer tout le bloc :**

```tsx
// ⚠️ BLOCAGE AVANT PAIEMENT - DÉBUT DU BLOC À SUPPRIMER ⚠️
  const isDemoMode = process.env.NEXT_PUBLIC_SHOW_PAYMENT_BANNER === "true";
  if (isDemoMode) {
    return null;
  }
// ⚠️ BLOCAGE AVANT PAIEMENT - FIN DU BLOC À SUPPRIMER ⚠️
```

---

### 3️⃣ Supprimer la bannière + variable

**Fichiers à supprimer :**
- `/src/components/banner/PaymentBanner.tsx`

**Dans `/src/app/layout.tsx`, supprimer :**
```tsx
import { WhatsappFloat, InstallPWA, IOSInstallPrompt, PaymentBanner } from "@/components";
```
Remplacer par :
```tsx
import { WhatsappFloat, InstallPWA, IOSInstallPrompt } from "@/components";
```

**ET supprimer :**
```tsx
<PaymentBanner />
```

**Dans `/src/components/index.ts`, supprimer :**
```tsx
export { default as PaymentBanner } from "./banner/PaymentBanner";
```

**Dans `.env`, supprimer :**
```env
NEXT_PUBLIC_SHOW_PAYMENT_BANNER=true
```

---

## 🚀 Redéployer

```bash
git add .
git commit -m "✅ Activation complète - Client payé"
git push
```

---

## ✅ Vérifier

- [ ] Page `/booking` accessible
- [ ] Bouton WhatsApp visible en bas à droite
- [ ] Pas de bannière orange
- [ ] Tout fonctionne normalement

**C'EST TERMINÉ ! 🎉**
