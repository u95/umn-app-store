const CACHE_NAME = 'umn-play-store-v12';

const isPreview = 
  self.location.hostname.includes('ais-dev') || 
  self.location.hostname.includes('ais-pre') || 
  self.location.hostname.includes('localhost') || 
  self.location.hostname.includes('127.0.0.1');

const PRECACHE_ASSETS = isPreview ? [] : [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  if (isPreview) {
    self.skipWaiting();
    return;
  }
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
          if (isPreview || key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (isPreview) return;

  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Bypass Service Worker completely for any external/cross-origin requests.
  // This allows the browser to perform native downloads (e.g., APK files from GitHub releases)
  // and fetch external assets without CORS or cache interception.
  if (url.origin !== self.location.origin) {
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
  // Use .includes('/assets/') to support subdirectory deployments like GitHub Pages (/umn-app-store/assets/)
  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && (url.protocol === 'http:' || url.protocol === 'https:')) {
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
        if (networkResponse && networkResponse.status === 200 && (url.protocol === 'http:' || url.protocol === 'https:')) {
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
            return caches.match('./', { ignoreSearch: true }).then((r) => {
              if (r) return r;
              return caches.match('./index.html', { ignoreSearch: true }).then((r2) => {
                if (r2) return r2;
                // Ultimate fallback: search cache for any key ending with index.html or /
                return caches.open(CACHE_NAME).then((cache) => {
                  return cache.keys().then((keys) => {
                    const match = keys.find(k => k.url.endsWith('index.html') || k.url.endsWith('/'));
                    if (match) {
                      return cache.match(match);
                    }
                  });
                });
              });
            });
          }
        });
      })
  );
});
