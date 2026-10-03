// VieWorld Service Worker — PWA Offline Caching for My Space and Core Assets
// Vite replaces this version with a digest of the release, including public assets.
const CACHE_NAME = 'vieworld-pwa-v4';
const CORE_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/myspace-room-v2.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_PRECACHE).catch(() => {});
    })
  );
  // Existing tabs keep their current bundle until the next activation.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key.startsWith('vieworld-pwa-') && key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const navigation = event.request.mode === 'navigate';
  const asset = url.pathname.startsWith('/images/') || url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/assets/');
  if (!navigation && !asset) return;

  // Public URLs are not hashed. Refresh them in the background so updated artwork
  // can replace a cached version while keeping an offline response available.
  if (url.pathname.startsWith('/images/') || url.pathname.includes('font') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webp')) {
    const fresh = fetch(event.request).then(async response => {
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) return new Response('Resource unavailable', { status: 503 });
      try { const cache = await caches.open(CACHE_NAME); await cache.put(event.request, response.clone()); } catch { /* Storage denial must not discard a valid network response. */ }
      return response;
    }).catch(() => undefined);
    event.waitUntil(fresh.then(() => {}));
    event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(event.request)).catch(() => undefined)
      .then(async cached => cached || await fresh || new Response('Offline: resource unavailable', { status: 503 })));
    return;
  }

  // Network-first with cache fallback for HTML and app scripts
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!navigation && response.headers.get('content-type')?.includes('text/html')) return new Response('Resource unavailable', { status: 503 });
        if (response && response.ok) {
          const clone = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(navigation ? '/index.html' : event.request, clone)).catch(() => {}));
        }
        return response;
      })
      .catch(() => caches.open(CACHE_NAME).then(cache => cache.match(navigation ? '/index.html' : event.request)).catch(() => undefined).then(res => res || new Response('Offline: resource unavailable', { status: 503 })))
  );
});
