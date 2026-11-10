const CACHE = 'ai-komekshi-pwa-v1';
const BASE = new URL('./', self.location.href);
const HOME = new URL('index.html', BASE).href;
const FILES = [
  HOME,
  new URL('manifest.json', BASE).href,
  new URL('icon.svg', BASE).href
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key =>
            key.startsWith('ai-komekshi-pwa-') && key !== CACHE
          )
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    url.origin !== BASE.origin ||
    !url.pathname.startsWith(BASE.pathname)
  ) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(HOME))
    );
    return;
  }

  if (FILES.includes(url.href)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
