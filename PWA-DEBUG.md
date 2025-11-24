# 🔍 Guide de débogage PWA - CAM

## ✅ Corrections appliquées

### 1. **Manifest corrigé** (`/public/site.webmanifest`)
- ✅ Nom et description corrects : "CAM - Mécanicien à domicile"
- ✅ `start_url` et `scope` ajoutés
- ✅ Couleurs du thème adaptées (jaune `#ca8a04` / noir `#0a0a0a`)
- ✅ Icônes avec `purpose: "any maskable"` pour compatibilité maximale
- ✅ Métadonnées complètes (lang, dir, categories)

### 2. **Logique de détection mobile simplifiée**
- ❌ Suppression de la double vérification mobile qui causait des conflits
- ✅ L'événement `beforeinstallprompt` est maintenant capturé correctement
- ✅ Le bouton s'affiche dès que l'événement est déclenché (Android uniquement)

---

## 🧪 Comment tester sur Android (simulé)

### Étape 1 : Vider le cache et localStorage
Ouvrez la console Chrome DevTools (F12) et exécutez :
```javascript
// Supprimer le localStorage qui bloque l'affichage
localStorage.removeItem('pwa-install-dismissed');

// Vérifier que c'est bien supprimé
console.log('Dismissed:', localStorage.getItem('pwa-install-dismissed'));
```

### Étape 2 : Activer le mode mobile
1. Ouvrez Chrome DevTools (F12)
2. Cliquez sur l'icône mobile (Toggle device toolbar) ou `Ctrl+Shift+M`
3. Sélectionnez un appareil Android (ex: "Pixel 5", "Galaxy S20")
4. **Important** : Vérifiez que le User-Agent contient "Android"

### Étape 3 : Vérifier le Service Worker
Dans la console, tapez :
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});
```

Vous devriez voir : `✅ Service Worker enregistré: http://localhost:3000/`

### Étape 4 : Forcer l'événement beforeinstallprompt
Chrome ne déclenche `beforeinstallprompt` que si :
- ✅ Le site est en HTTPS (ou localhost)
- ✅ Le manifest est valide
- ✅ Le Service Worker est enregistré
- ✅ L'utilisateur a visité le site au moins 2 fois (avec 5 min d'écart)
- ✅ L'utilisateur a interagi avec la page (clic, scroll)

**Astuce pour tester immédiatement :**
1. DevTools > Application > Manifest
2. Vérifiez que le manifest est bien chargé
3. DevTools > Application > Service Workers
4. Vérifiez que le SW est actif

### Étape 5 : Vérifier les logs
Dans la console, vous devriez voir :
```
✅ Service Worker enregistré: http://localhost:3000/
🎁 beforeinstallprompt capturé
```

Si vous voyez `⏳ PWA dismissed`, c'est que le localStorage bloque → retour à l'étape 1.

---

## 🚀 Test en production (déployé)

### Sur un vrai téléphone Android :
1. Ouvrez Chrome sur Android
2. Visitez votre site en HTTPS
3. Naviguez sur 2-3 pages
4. Attendez 5-10 secondes
5. Le message PWA devrait apparaître en bas

### Vérifier le manifest en production :
Visitez : `https://votre-site.com/site.webmanifest`

Vous devriez voir :
```json
{
  "name": "CAM - Mécanicien à domicile",
  "short_name": "CAM",
  "start_url": "/",
  ...
}
```

---

## 🐛 Problèmes courants

### Le message n'apparaît toujours pas ?

#### 1. Vérifier le localStorage
```javascript
// Dans la console
localStorage.getItem('pwa-install-dismissed')
// Si ça retourne une date → supprimez-la
localStorage.removeItem('pwa-install-dismissed');
```

#### 2. Vérifier que l'app n'est pas déjà installée
```javascript
// Dans la console
window.matchMedia('(display-mode: standalone)').matches
// Si true → l'app est déjà installée, le message ne s'affichera pas
```

#### 3. Vérifier le User-Agent
```javascript
// Dans la console
navigator.userAgent
// Doit contenir "Android" pour que le message s'affiche
```

#### 4. Forcer le rechargement du manifest
1. DevTools > Application > Clear storage
2. Cochez "Unregister service workers"
3. Cliquez sur "Clear site data"
4. Rechargez la page (Ctrl+Shift+R)

---

## 📱 Différence iOS vs Android

### Android (Chrome)
- ✅ Événement `beforeinstallprompt` supporté
- ✅ Bannière personnalisée avec bouton "Installer"
- ✅ Installation en 1 clic

### iOS (Safari)
- ❌ Pas d'événement `beforeinstallprompt`
- ✅ Bannière avec instructions manuelles
- ⚠️ L'utilisateur doit ajouter manuellement via "Partager" > "Sur l'écran d'accueil"

---

## 🔧 Commandes utiles

### Redémarrer le dev server
```bash
npm run dev
```

### Vérifier que les icônes existent
```bash
ls -lh public/web-app-manifest-*.png
```

### Tester le manifest
```bash
curl http://localhost:3000/site.webmanifest | jq
```

---

## ✅ Checklist finale

- [ ] Manifest contient "CAM - Mécanicien à domicile"
- [ ] Service Worker enregistré (console)
- [ ] localStorage vide (`pwa-install-dismissed`)
- [ ] Mode mobile Android activé (DevTools)
- [ ] Au moins 2 visites sur le site (ou attendre 5 min)
- [ ] Interaction avec la page (clic, scroll)
- [ ] HTTPS ou localhost
- [ ] Icônes 192x192 et 512x512 présentes

Si tout est ✅, le message devrait apparaître !
