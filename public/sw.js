const CACHE = 'vinculo-vivo-v1';
const BASE = self.location.pathname.replace(/sw\.js$/, '');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll([BASE, BASE + 'index.html', BASE + 'manifest.webmanifest']),
    ).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        fetch(req).then((res) => {
          if (res?.status === 200 && res.type === 'basic') {
            caches.open(CACHE).then((c) => c.put(req, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res?.status === 200 && res.type === 'basic') {
          caches.open(CACHE).then((c) => c.put(req, res.clone()));
        }
        return res;
      }).catch(() => {
        if (req.mode === 'navigate') return caches.match(BASE + 'index.html');
      });
    }),
  );
});
