// ===========================================================================
// Service Worker - Lamis VTC
// ===========================================================================
// 👉 À QUOI IL SERT ?
// Le Service Worker transforme ton site en **PWA** (Progressive Web App)
// Cela permet notamment :
// ✔ L’installation sur l'écran d'accueil (comme une app native)
// ✔ Le fonctionnement partiel **offline**
// ✔ Un affichage plus rapide grâce à la mise en cache
//
// ⚙️ STRATÉGIE UTILISÉE : Network First (réseau prioritaire, cache en secours)
// Cela signifie :
// - Le SW essaie d'abord de charger les ressources depuis internet
// - Si le réseau est indisponible ou lent → il utilise le cache local
//
// 📌 IMPORTANT :
// Le Service Worker fonctionne uniquement sur HTTPS ou localhost 🔐
// Il doit être activé au moins une fois pour que la PWA soit installable
// ===========================================================================

const CACHE_NAME = "cam-v1";
const STATIC_ASSETS = [
  "/",
  "/tarifs",
  "/services",
  "/booking",
  "/contact",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
];

// ---------------------------------------------------------------------------
// Installation du Service Worker
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  console.log("[SW] Installation en cours...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cache des assets statiques");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force l'activation immédiate
  self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Activation du Service Worker
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  console.log("[SW] Activation en cours...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Suppression ancien cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prend le contrôle immédiatement
  return self.clients.claim();
});

// ---------------------------------------------------------------------------
// Stratégie de cache : Network First, fallback sur Cache
// ---------------------------------------------------------------------------
self.addEventListener("fetch", (event) => {
  // Ignore les requêtes non-GET (POST, PUT, etc.)
  if (event.request.method !== "GET") return;

  // Ignore les requêtes vers des domaines externes (Google Maps, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  //! ❗ IMPORTANT SEO : Ne pas intercepter sitemap & robots.txt
  if (
    event.request.url.includes("/sitemap.xml") ||
    event.request.url.includes("/robots.txt")
  ) {
    return fetch(event.request); // Retour réseau pur
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réussit, met à jour le cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utilise le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Pas de cache disponible
          return new Response("Hors ligne", {
            status: 503,
            statusText: "Service Unavailable",
          });
        });
      })
  );
});
