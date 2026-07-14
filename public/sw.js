const CACHE_NAME = 'umn-play-store-v5';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://img.icons8.com/color/192/google-play.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache warning during install:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Self-detect if we are in development/preview environment
  const isDev = self.location.hostname.includes('localhost') || 
                self.location.hostname.includes('127.0.0.1') || 
                self.location.hostname.includes('ais-dev');

  if (isDev) {
    // In development mode, wipe cache, unregister service worker and fetch directly from network
    console.warn('[SW] Dev environment detected. Self-healing/unregistering...', url.href);
    e.respondWith(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      }).then(() => {
        return self.registration.unregister();
      }).then(() => {
        return fetch(e.request);
      })
    );
    return;
  }

  // Self-healing: If a reload_buster is present (meaning a client-side chunk loading or syntax error was detected),
  // immediately wipe the cache and serve directly from network to repair the app state.
  if (url.searchParams.has('reload_buster')) {
    console.warn('[SW] Reload buster detected! Wiping cache for self-healing...', url.href);
    e.respondWith(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      }).then(() => {
        return fetch(e.request);
      })
    );
    return;
  }

  // Bypass API calls, live sockets, and external authentication/firebase services
  if (
    url.pathname.includes('/api/') || 
    url.pathname.includes('socket.io') || 
    url.hostname.includes('firebase') || 
    url.hostname.includes('googleapis')
  ) {
    return;
  }

  // 1. Assets (Vite bundled hashes in /assets/) -> Cache-First
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Main pages, index.html, root, and other requests -> Network-First
  // We use { ignoreSearch: true } to ensure query params like ?pwa=true do not break cache matching.
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network is unavailable/offline
        return caches.match(e.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If completely offline and requesting page navigation, return cached root/index.html
          if (e.request.mode === 'navigate') {
            return caches.match('/', { ignoreSearch: true }).then((r) => {
              if (r) return r;
              return caches.match('/index.html', { ignoreSearch: true });
            });
          }
        });
      })
  );
});
