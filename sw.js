const CACHE = 'bfarm-v9';
const ASSETS = [
  '/',
  '/bismillah/',
  '/bismillah/index.html',
  '/bismillah/manifest.json',
  '/bismillah/icon-192.png',
  '/bismillah/icon-512.png'
];

// Install - cache all assets immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate - delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - cache first, then network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        // Return cached immediately, update in background
        fetch(e.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE).then(cache => cache.put(e.request, response));
          }
        }).catch(() => {});
        return cached;
      }
      // Not in cache - fetch from network
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/bismillah/index.html'));
    })
  );
});
