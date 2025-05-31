const CACHE_NAME = 'pitchecklist-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './assets/style.css',
    './assets/logo.png',
    './assets/favicon-96x96.png',
    './assets/favicon.svg',
    './assets/favicon.ico',
    './assets/apple-touch-icon.png',
    './assets/site.webmanifest',
    'https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap'
];

// Install event: cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// Fetch event: try network first, update cache, fallback to cache if offline
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Update cache with latest version
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // If network fails, try cache
                return caches.match(event.request, { ignoreSearch: true });
            })
    );
});