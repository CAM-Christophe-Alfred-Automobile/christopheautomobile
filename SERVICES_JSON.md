# 📋 Documentation du système de services JSON

## 🎯 Vue d'ensemble

Le fichier `src/app/data/services.json` est la base de données centrale du site qui contient tous les services proposés par le garage. Il est utilisé par deux pages principales :

- **Page Booking** (`/booking`) : Pour la sélection d'interventions
- **Page Tarifs** (`/tarifs`) : Pour l'affichage automatique des prix

---

## 📄 Structure du fichier JSON

### Format d'un service

```json
{
  "categorie": "Entretien & vidanges",
  "service": "Vidange moteur",
  "description": "huile moteur uniquement",
  "duree": 60,
  "prix": 50
}
```

### Champs obligatoires

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `categorie` | string | Catégorie du service | `"Entretien & vidanges"` |
| `service` | string | Nom du service | `"Vidange moteur"` |
| `description` | string | Description courte (peut être vide `""`) | `"huile moteur uniquement"` |
| `duree` | number | Durée en minutes | `60` |
| `prix` | number ou string | Prix en euros (optionnel) | `50` ou `"250-400"` |

---

## 🎨 Catégories disponibles

Les services sont groupés par catégories :

1. **Entretien & vidanges**
2. **Freinage**
3. **Distribution / Moteur**
4. **Refroidissement**
5. **Transmission / Embrayage**
6. **Train roulant / Suspension**
7. **Électricité / Électronique**
8. **Climatisation**
9. **Diagnostic / Contrôles**
10. **Déplacement / Divers**

---

## 💰 Gestion des prix

### Prix fixe

```json
{
  "service": "Vidange moteur",
  "prix": 50
}
```

### Fourchette de prix

```json
{
  "service": "Embrayage complet",
  "prix": "250-400"
}
```

### Sans prix (sur devis)

```json
{
  "service": "Réparation complexe",
  "duree": 180
  // Pas de champ "prix"
}
```

---

## 🎨 Code couleur automatique (Page Tarifs)

Les prix sont automatiquement colorés selon leur montant :

| Couleur | Plage de prix | Classe CSS |
|---------|---------------|------------|
| 🟢 **Vert** | < 100€ | `text-green-400` |
| 🟡 **Jaune** | 100€ - 300€ | `text-yellow-400` |
| 🔴 **Rouge** | > 300€ | `text-red-400` |
| ⚪ **Gris** | Sur devis | `text-gray-500` |

---

## ⏱️ Gestion des durées

### Durées standards

Les durées sont en **minutes** :

```json
{
  "service": "Vidange moteur",
  "duree": 60  // 1 heure
}
```

```json
{
  "service": "Distribution complète",
  "duree": 480  // 8 heures (journée complète)
}
```

### Conversion automatique

La fonction `formatDuree()` convertit automatiquement :
- `60` → `"1h"`
- `90` → `"1h30"`
- `120` → `"2h"`
- `480` → `"8h"`

---

## 🔗 Utilisation dans la page Booking

### 1. Sélection par catégorie

L'utilisateur choisit une catégorie, et tous les services de cette catégorie s'affichent.

### 2. Sélection multiple

L'utilisateur peut sélectionner plusieurs interventions. La durée totale est calculée automatiquement.

### 3. Calcul de durée

```typescript
const durees = servicesData
  .filter((s) => selected.includes(s.service))
  .map((s) => s.duree);
const total = durees.reduce((acc, cur) => acc + cur, 0);
```

### 4. Redirection Cal.com

Selon la durée totale, l'utilisateur est redirigé vers l'événement Cal.com correspondant :

| Durée totale | Événement Cal.com |
|--------------|-------------------|
| ≤ 60 min | `/1h` |
| ≤ 90 min | `/1h30` |
| ≤ 120 min | `/2h` |
| ≤ 150 min | `/2h30` |
| ≤ 180 min | `/3h` |
| ≤ 240 min | `/4h` |
| ≤ 300 min | `/5h` |
| ≤ 360 min | `/6h` |
| > 360 min | `/journee-complete` |

---

## 📊 Utilisation dans la page Tarifs

### 1. Groupement par catégorie

Les services sont automatiquement groupés par catégorie :

```typescript
const categories = Array.from(new Set(servicesData.map((s) => s.categorie)));
```

### 2. Affichage en colonnes

Layout masonry (2 colonnes sur desktop) pour optimiser l'espace :

```tsx
<div className="lg:columns-2 gap-6">
  {categories.map((categorie) => (
    <section key={categorie}>
      <h2>{categorie}</h2>
      {/* Services de la catégorie */}
    </section>
  ))}
</div>
```

### 3. Code couleur des prix

```typescript
const getPrixColor = (prix: number | string | undefined) => {
  if (!prix) return "text-gray-500";
  const prixNum = typeof prix === "string" ? parseInt(prix.split("-")[0]) : prix;
  if (prixNum < 100) return "text-green-400";
  if (prixNum >= 100 && prixNum <= 300) return "text-yellow-400";
  return "text-red-400";
};
```

---

## ✏️ Comment ajouter un nouveau service

### 1. Ouvrir le fichier JSON

```bash
src/app/data/services.json
```

### 2. Ajouter un nouvel objet

```json
{
  "categorie": "Entretien & vidanges",
  "service": "Nouveau service",
  "description": "Description du service",
  "duree": 90,
  "prix": 75
}
```

### 3. Respecter le format

- ✅ Virgule après chaque objet (sauf le dernier)
- ✅ Guillemets doubles pour les strings
- ✅ Pas de virgule après le dernier champ
- ✅ Durée en minutes (nombre)
- ✅ Prix en euros (nombre ou string pour fourchette)

### 4. Vérifier le JSON

Utilisez un validateur JSON en ligne ou :

```bash
pnpm run build
```

Si le JSON est invalide, le build échouera avec un message d'erreur.

---

## 🔧 Maintenance

### Modifier un prix

Cherchez le service et modifiez le champ `prix` :

```json
{
  "service": "Vidange moteur",
  "duree": 60,
  "prix": 55  // Ancien prix : 50
}
```

### Modifier une durée

```json
{
  "service": "Distribution",
  "duree": 420,  // Ancien : 480
  "prix": 170
}
```

### Ajouter une catégorie

Créez simplement un service avec une nouvelle catégorie :

```json
{
  "categorie": "Nouvelle catégorie",
  "service": "Premier service",
  "description": "",
  "duree": 60,
  "prix": 50
}
```

La catégorie apparaîtra automatiquement sur les pages Booking et Tarifs.

---

## ⚠️ Erreurs courantes

### Erreur : "Unexpected token"

**Cause** : Virgule manquante ou en trop

```json
// ❌ Mauvais
{
  "service": "Test",
  "duree": 60
}
{
  "service": "Test 2",
  "duree": 90
}

// ✅ Bon
{
  "service": "Test",
  "duree": 60
},
{
  "service": "Test 2",
  "duree": 90
}
```

### Erreur : "Cannot parse JSON"

**Cause** : Virgule après le dernier élément

```json
// ❌ Mauvais
[
  {
    "service": "Test",
    "duree": 60
  },  // ← Virgule en trop
]

// ✅ Bon
[
  {
    "service": "Test",
    "duree": 60
  }
]
```

---

## 🚀 Bonnes pratiques

### 1. Descriptions claires

```json
// ✅ Bon
{
  "service": "Vidange boîte auto",
  "description": "Huile + crépine sans rinçage"
}

// ❌ À éviter
{
  "service": "Vidange boîte auto",
  "description": ""
}
```

### 2. Durées réalistes

Basez-vous sur l'expérience terrain :
- Vidange simple : 60 min
- Plaquettes : 60-90 min
- Distribution : 480 min (8h)

### 3. Prix cohérents

- Utilisez des fourchettes pour les interventions variables
- Laissez vide si le prix dépend trop du véhicule
- Soyez transparent sur les tarifs

### 4. Catégories logiques

Regroupez les services similaires :
- Tout ce qui touche aux freins → "Freinage"
- Tout ce qui touche au moteur → "Distribution / Moteur"

---

## 📈 Statistiques

Le fichier actuel contient :
- **~100 services** différents
- **10 catégories** principales
- **Durées** : de 15 min à 1440 min (24h)
- **Prix** : de 10€ à 900€

---

## 🔄 Synchronisation

Le JSON est utilisé en temps réel :
- ✅ Aucun cache côté serveur
- ✅ Modifications visibles immédiatement après rebuild
- ✅ Pas de base de données externe nécessaire

---

**Dernière mise à jour** : Octobre 2025  
**Auteur** : MJM Coding
