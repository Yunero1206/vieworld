// VieWorld Service Worker — PWA Offline Caching for My Space and Core Assets
const CACHE_NAME = 'vieworld-pwa-v2';
const CORE_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/myspace-room-v2.png',
  '/images/world-v8/plaza.webp',
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

  // Cache-first for images and fonts
  if (url.pathname.startsWith('/images/') || url.pathname.includes('font') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webp')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => cache.match(event.request)).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {}));
          }
          return response;
        }).catch(() => new Response('Offline: resource unavailable', { status: 503 }));
      })
    );
    return;
  }

  // Network-first with cache fallback for HTML and app scripts
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok && (navigation || !response.headers.get('content-type')?.includes('text/html'))) {
          const clone = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(navigation ? '/index.html' : event.request, clone)).catch(() => {}));
        }
        return response;
      })
      .catch(() => caches.open(CACHE_NAME).then(cache => cache.match(navigation ? '/index.html' : event.request)).then(res => res || new Response('Offline: resource unavailable', { status: 503 })))
  );
});
