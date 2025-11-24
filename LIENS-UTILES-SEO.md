# 🔗 LIENS UTILES - SEO & CONFIGURATION

## 📊 OUTILS GOOGLE

### Google Search Console
- **URL** : https://search.google.com/search-console
- **Utilité** : Soumettre le sitemap, vérifier l'indexation, voir les performances SEO
- **À faire après paiement** : Ajouter la propriété + soumettre le sitemap

### Google Business Profile
- **URL** : https://business.google.com
- **Utilité** : Créer la fiche Google Maps de l'entreprise
- **À faire après paiement** : Créer la fiche + vérification

### Google Analytics (optionnel)
- **URL** : https://analytics.google.com
- **Utilité** : Suivre le trafic du site
- **Note** : Pas encore configuré sur le site

---

## 🌐 URLS DU SITE (À INDEXER)

### Pages principales
- Page d'accueil : `https://christopheautomobile.fr/`
- Tarifs : `https://christopheautomobile.fr/tarifs`
- Réservation : `https://christopheautomobile.fr/booking`
- Contact : `https://christopheautomobile.fr/contact`
- Mentions légales : `https://christopheautomobile.fr/mentions-legales`

### Fichiers SEO
- Sitemap : `https://christopheautomobile.fr/sitemap.xml`
- Robots.txt : `https://christopheautomobile.fr/robots.txt`
- Manifest PWA : `https://christopheautomobile.fr/site.webmanifest`

---

## 🛠️ OUTILS DE TEST SEO

### Test de robots.txt
- **URL** : https://www.google.com/webmasters/tools/robots-testing-tool
- **Utilité** : Vérifier que le robots.txt est correct

### Test de données structurées (Schema.org)
- **URL** : https://search.google.com/test/rich-results
- **Utilité** : Vérifier que les schémas JSON-LD sont valides
- **À tester** : Coller l'URL du site pour voir si Google détecte bien le LocalBusiness

### PageSpeed Insights
- **URL** : https://pagespeed.web.dev
- **Utilité** : Tester la vitesse du site (important pour le SEO)
- **À tester** : `https://christopheautomobile.fr/`

### Test Mobile-Friendly
- **URL** : https://search.google.com/test/mobile-friendly
- **Utilité** : Vérifier que le site est optimisé mobile
- **À tester** : `https://christopheautomobile.fr/`

---

## 📱 VÉRIFICATION PWA

### Lighthouse (dans Chrome DevTools)
1. Ouvrir le site dans Chrome
2. F12 > Onglet "Lighthouse"
3. Cocher "Progressive Web App"
4. Cliquer sur "Analyze page load"
5. Vérifier le score PWA (devrait être > 90)

### PWA Builder
- **URL** : https://www.pwabuilder.com
- **Utilité** : Analyser la qualité de la PWA
- **À tester** : Coller l'URL du site

---

## 🔍 VÉRIFICATION ACTUELLE (AVANT PAIEMENT)

### Robots.txt
```bash
curl https://christopheautomobile.fr/robots.txt
```

**Résultat attendu AVANT paiement :**
```txt
User-agent: *
Disallow: /
```

**Résultat attendu APRÈS paiement :**
```txt
User-agent: *
Allow: /

Sitemap: https://christopheautomobile.fr/sitemap.xml
```

---

### Sitemap
```bash
curl https://christopheautomobile.fr/sitemap.xml
```

**Résultat attendu :**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://christopheautomobile.fr/</loc>
    <lastmod>...</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ...
</urlset>
```

---

### Manifest PWA
```bash
curl https://christopheautomobile.fr/site.webmanifest
```

**Résultat attendu :**
```json
{
  "name": "Christophe AutoMobile",
  "short_name": "CAM",
  "start_url": "/",
  ...
}
```

---

## 📈 SUIVI APRÈS ACTIVATION

### Dans Google Search Console (après 7-14 jours)

Vérifier :
- **Couverture** : Nombre de pages indexées (devrait être ~5-8)
- **Performances** : Impressions, clics, position moyenne
- **Expérience** : Core Web Vitals (vitesse du site)
- **Améliorations** : Ergonomie mobile, données structurées

### Mots-clés à surveiller

Le site devrait apparaître pour :
- "mécanicien auto Salon-de-Provence"
- "réparation voiture Salon-de-Provence"
- "dépannage auto domicile Salon"
- "garage mobile Salon-de-Provence"
- "entretien auto domicile Salon"

---

## 🎯 OBJECTIFS SEO (3-6 mois)

- [ ] Apparaître en **première page Google** pour "mécanicien Salon-de-Provence"
- [ ] Obtenir **10-20 avis Google** positifs (via Google Business)
- [ ] Avoir **100+ visiteurs/mois** organiques
- [ ] Générer **5-10 demandes de devis/mois** via le site

---

## 📞 RESSOURCES SUPPLÉMENTAIRES

### Documentation Next.js SEO
- https://nextjs.org/learn/seo/introduction-to-seo

### Guide Google SEO
- https://developers.google.com/search/docs/beginner/seo-starter-guide

### Schema.org (données structurées)
- https://schema.org/LocalBusiness
- https://schema.org/AutomotiveBusiness

---

**Bon référencement ! 🚀**
