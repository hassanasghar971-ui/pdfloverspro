const VERSION = 'plp-sw-v1';
const STATIC_CACHE = VERSION + '-static';
const PAGES_CACHE = VERSION + '-pages';
const OCR_CACHE = VERSION + '-ocr';
const KEEP = [STATIC_CACHE, PAGES_CACHE, OCR_CACHE];
const OCR_HOSTS = ['tessdata.projectnaptha.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.add('/'))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((n) => KEEP.indexOf(n) === -1).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone()).catch(() => undefined);
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch (err) {
    const cached = (await cache.match(request)) || (await cache.match('/'));
    if (cached) return cached;
    return new Response('You are offline and this page is not saved yet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || request.headers.has('range')) return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (url.pathname.indexOf('/api/') === 0) return;
    if (url.pathname.indexOf('/_next/static/') === 0) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }
    if (request.mode === 'navigate') {
      event.respondWith(networkFirst(request, PAGES_CACHE));
    }
    return;
  }

  if (OCR_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(cacheFirst(request, OCR_CACHE));
  }
});
