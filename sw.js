const CACHE_NAME = 'armoise-v2'; // J'ai changé v1 en v2 pour forcer la mise à jour
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
    // J'ai retiré les liens https://... car ils causent l'erreur CORS
];

// Installation : on ne cache que les fichiers locaux vitaux
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting(); // Force le nouveau service worker à s'activer immédiatement
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Nettoie l'ancien cache v1 qui buggait
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Stratégie de chargement : Cache d'abord, puis Réseau
self.addEventListener('fetch', (e) => {
    // On ignore les requêtes vers les autres domaines (Tailwind, Firebase, etc) pour éviter l'erreur CORS
    if (!e.request.url.startsWith(location.origin)) {
        return; 
    }

    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
