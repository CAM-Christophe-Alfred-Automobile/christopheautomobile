# 📋 FILTRAGE DES PRESTATIONS - PAGE BOOKING

## 🎯 OBJECTIF

Empêcher la réservation en ligne des prestations **"sur devis"** ou sans durée définie.

Ces prestations restent **visibles sur la page /tarifs** mais sont **automatiquement exclues de la page /booking**.

---

## ✅ PRESTATIONS EXCLUES DE LA RÉSERVATION

Les prestations suivantes **NE PEUVENT PAS** être réservées en ligne :

### 1. **Durée non définie (`duree: null`)**
Exemple :
```json
{
  "service": "Injecteurs (4)",
  "duree": null,
  "prix": null
}
```

### 2. **Durée non numérique (`duree: "Variable"`)**
Exemple :
```json
{
  "service": "Intervention urgente",
  "duree": "Variable",
  "prix": "40-80"
}
```

### 3. **Prix non défini (`prix: null`)**
Exemple :
```json
{
  "service": "Chaîne de distribution",
  "duree": 720,
  "prix": null
}
```

### 4. **Prix non numérique (`prix: "Gratuit"` ou `prix: "40-80"`)**
Exemple :
```json
{
  "service": "Diagnostic Déplacement Zone 1",
  "duree": null,
  "prix": "Gratuit"
}
```

### 5. **Explicitement réservé aux tarifs (`afficherDans: ["tarifs"]`)**
Exemple :
```json
{
  "service": "Intervention urgente",
  "duree": "Variable",
  "prix": "40-80",
  "afficherDans": ["tarifs"]
}
```

---

## 🔍 LISTE DES PRESTATIONS EXCLUES (ACTUELLEMENT)

D'après le fichier `services.json`, voici les prestations **sur devis** :

### Moteur
- ❌ **Chaîne de distribution** (duree: 720, prix: null)
- ❌ **Injecteurs (4)** (duree: null, prix: null)
- ❌ **Pompe à injection** (duree: null, prix: null)
- ❌ **Capteur PMH / vilebrequin** (duree: null, prix: null)
- ❌ **Bougies d'allumage** (duree: 60, prix: null)
- ❌ **Boîtier de préchauffage** (duree: null, prix: null)
- ❌ **EGR / FAP** (duree: null, prix: null)

### Suspension / Direction
- ❌ **Ressorts arrière** (duree: null, prix: null)

### Électricité
- ❌ **Démarreur** (duree: null, prix: null)
- ❌ **Relais / fusible / faisceau** (duree: 90, prix: null)

### Diagnostic
- ❌ **Diagnostic Déplacement Zone 1** (duree: null, prix: "Gratuit")
- ❌ **Diagnostic Déplacement Zone 2** (duree: null, prix: 15)
- ❌ **Diagnostic Déplacement Zone 3** (duree: null, prix: 20)
- ❌ **Contrôle avant achat** (duree: null, prix: null)

### Autre interventions
- ❌ **Intervention urgente** (duree: "Variable", prix: "40-80", afficherDans: ["tarifs"])

---

## 💻 CODE IMPLÉMENTÉ

### Fichier : `/src/app/booking/page.tsx`

```tsx
//! Prestations filtrées (exclure celles qui sont uniquement pour la page tarifs)
//! ET exclure celles sans durée définie (sur devis) ou avec durée/prix non numériques
const prestations = servicesData.filter(
  (s) =>
    s.categorie === categorie &&
    // Exclure si explicitement réservé aux tarifs uniquement
    (!s.afficherDans || s.afficherDans.includes("booking")) &&
    // Exclure si durée est null, non numérique, ou "Variable"
    s.duree !== null &&
    typeof s.duree === "number" &&
    // Exclure si prix est null ou non numérique (sur devis)
    s.prix !== null &&
    typeof s.prix === "number"
);
```

---

## 📝 COMMENT AJOUTER UNE NOUVELLE PRESTATION "SUR DEVIS"

### Option 1 : Durée ou prix non défini
```json
{
  "categorie": "Moteur",
  "service": "Ma nouvelle prestation",
  "description": "Description",
  "duree": null,  // ← Pas de durée définie
  "prix": null    // ← Sur devis
}
```
✅ Sera **visible sur /tarifs** mais **invisible sur /booking**

---

### Option 2 : Durée ou prix non numérique
```json
{
  "categorie": "Diagnostic",
  "service": "Intervention spéciale",
  "description": "Description",
  "duree": "Variable",  // ← Durée variable
  "prix": "Sur devis"   // ← Prix sur devis
}
```
✅ Sera **visible sur /tarifs** mais **invisible sur /booking**

---

### Option 3 : Réservé explicitement aux tarifs
```json
{
  "categorie": "Autre",
  "service": "Prestation exceptionnelle",
  "description": "Description",
  "duree": 120,
  "prix": 50,
  "afficherDans": ["tarifs"]  // ← Uniquement sur /tarifs
}
```
✅ Sera **visible sur /tarifs** mais **invisible sur /booking**

---

## ✅ AVANTAGES DE CETTE APPROCHE

1. **Automatique** : Pas besoin de modifier le code pour chaque nouvelle prestation
2. **Flexible** : Plusieurs façons d'exclure une prestation
3. **Sécurisé** : Impossible de réserver une prestation "sur devis" par erreur
4. **Maintenable** : Toute la logique est centralisée dans un seul filtre

---

## 🧪 COMMENT TESTER

### Test 1 : Vérifier qu'une prestation "sur devis" n'apparaît pas
1. Aller sur `/booking`
2. Sélectionner la catégorie **"Moteur"**
3. Vérifier que **"Chaîne de distribution"** n'apparaît PAS dans la liste

### Test 2 : Vérifier qu'elle apparaît bien sur /tarifs
1. Aller sur `/tarifs`
2. Ouvrir la catégorie **"Moteur"**
3. Vérifier que **"Chaîne de distribution"** apparaît avec la mention **"Sur devis"**

---

## 📊 STATISTIQUES

Sur **~100 prestations** dans `services.json` :
- ✅ **~85 prestations** réservables en ligne
- ❌ **~15 prestations** sur devis uniquement

---

**Dernière mise à jour** : 24 novembre 2025
