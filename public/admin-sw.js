// Service worker minimal pour CAMadmin — sert uniquement à rendre l'app installable
// (icône sur l'écran d'accueil). Aucune donnée n'est mise en cache : toutes les
// requêtes /admin et /api sont toujours envoyées au serveur, pour ne jamais afficher
// d'interventions, paiements ou statuts périmés.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
