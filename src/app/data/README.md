# 📋 Documentation services.json

## Structure d'un service

```json
{
  "categorie": "Nom de la catégorie",
  "service": "Nom du service",
  "description": "Description optionnelle",
  "duree": 60,  // en minutes, ou "Variable"
  "prix": 50,   // en euros, ou "40-80" pour une fourchette
  "afficherDans": ["tarifs"]  // OPTIONNEL - contrôle où le service apparaît
}
```

## Champ `afficherDans` (optionnel)

Ce champ permet de contrôler sur quelles pages un service est affiché :

### Valeurs possibles :
- **Non défini** (par défaut) : Le service apparaît partout (booking + tarifs)
- **`["tarifs"]`** : Le service apparaît UNIQUEMENT sur la page tarifs
- **`["booking"]`** : Le service apparaît UNIQUEMENT sur la page réservation
- **`["tarifs", "booking"]`** : Le service apparaît sur les deux pages (équivalent à non défini)

### Cas d'usage :

#### Services uniquement pour la page tarifs
Utilisez `"afficherDans": ["tarifs"]` pour :
- Services informatifs (pas réservables en ligne)
- Interventions urgentes avec durée variable
- Services nécessitant un devis préalable

**Exemple :**
```json
{
  "categorie": "Déplacement / Divers",
  "service": "Intervention urgente",
  "description": "Dépannage sur zone",
  "duree": "Variable",
  "prix": "40-80",
  "afficherDans": ["tarifs"]
}
```

#### Services uniquement pour la page booking
Utilisez `"afficherDans": ["booking"]` pour :
- Services réservables mais pas affichés dans les tarifs publics
- Offres spéciales temporaires

## Logique de filtrage

### Page Booking (`/src/app/booking/page.tsx`)
```javascript
// Affiche les services SANS restriction OU marqués pour "booking"
const prestations = servicesData.filter(
  (s) => s.categorie === categorie && 
  (!s.afficherDans || s.afficherDans.includes("booking"))
);
```

### Page Tarifs (`/src/app/tarifs/page.tsx`)
```javascript
// Affiche les services SANS restriction OU marqués pour "tarifs"
const services = servicesData.filter(
  (s) => s.categorie === categorie && 
  (!s.afficherDans || s.afficherDans.includes("tarifs"))
);
```

## Exemples complets

### Service standard (apparaît partout)
```json
{
  "categorie": "Entretien & vidanges",
  "service": "Vidange moteur seule",
  "description": "huile moteur uniquement",
  "duree": 60,
  "prix": 30
}
```

### Service uniquement tarifs
```json
{
  "categorie": "Déplacement / Divers",
  "service": "Intervention urgente",
  "description": "Dépannage sur zone",
  "duree": "Variable",
  "prix": "40-80",
  "afficherDans": ["tarifs"]
}
```

### Service uniquement booking
```json
{
  "categorie": "Entretien & vidanges",
  "service": "Pack découverte",
  "description": "Offre spéciale nouveaux clients",
  "duree": 90,
  "prix": 45,
  "afficherDans": ["booking"]
}
```
