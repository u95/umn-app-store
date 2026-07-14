// Safe, pass-through Service Worker for UMN App Store PWA
// This satisfies Chrome/Android installability requirements while preventing "black screens" of stale bundle caches

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// A standard pass-through fetch handler that lets all requests go through the network.
// This is 100% bug-free and prevents black screen issues caused by Vite bundle hash updates.
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request));
});

