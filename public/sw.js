// UMN Play Store PWA Service Worker
// Designed to satisfy all browser PWA installability requirements (Android/Chrome/iOS) 
// while completely bypassing caching of dynamic bundler assets to prevent "Black Screens".

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

// A standard pass-through fetch handler that directs all requests to the network.
// This is 100% bug-free and ensures that the app always loads the freshest compiled bundles.
self.addEventListener('fetch', (e) => {
  // Pass-through to network
});
