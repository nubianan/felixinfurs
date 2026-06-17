/*  ╔══════════════════════════════════════════════════════════╗
    ║          THE JUNO ROOM — Service Worker                  ║
    ║  Caches the app shell + audio on first load so the       ║
    ║  experience works offline and loads instantly on return. ║
    ╚══════════════════════════════════════════════════════════╝ */

const VERSION     = 'juno-room-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const AUDIO_CACHE = `${VERSION}-audio`;
const FONT_CACHE  = `${VERSION}-fonts`;

/* Files that must be cached during install so the app loads offline */
const SHELL_ASSETS = [
  './',
  './index.html',
  /* Add any extra local assets here, e.g. favicon: './favicon.ico' */
];

/* ── INSTALL ─────────────────────────────────────────────────────────────
   Pre-cache the app shell. skipWaiting() activates the new SW immediately
   without waiting for the old tab to close.                              */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Shell cache failed:', err))
  );
});

/* ── ACTIVATE ────────────────────────────────────────────────────────────
   Delete any caches from previous versions, then claim all open tabs.    */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('juno-room-') && key !== VERSION &&
                         !key.startsWith(VERSION))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ───────────────────────────────────────────────────────────────
   Route each request to the appropriate caching strategy.                */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET and browser-extension requests */
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  /* ── Google Fonts: network-first, cache fallback ── */
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    event.respondWith(networkFirst(request, FONT_CACHE));
    return;
  }

  /* ── Audio files: cache-first (large files, serve instantly on replay) */
  if (url.pathname.includes('/audio/') ||
      request.destination === 'audio' ||
      /\.(mp3|ogg|wav|flac|aac|m4a)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstThenNetwork(request, AUDIO_CACHE));
    return;
  }

  /* ── App shell (HTML + everything else): cache-first ── */
  event.respondWith(cacheFirst(request, SHELL_CACHE));
});

/* ══════════════════════════════════════════════════════════════
   STRATEGY HELPERS
   ══════════════════════════════════════════════════════════════ */

/* Cache-first: return from cache if available, else fetch and cache */
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — The Juno Room is not cached yet. Please load once while connected.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/* Network-first: try network, fall back to cache (good for fonts/data) */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

/* Cache-first for audio with range-request passthrough
   (browsers use range requests for audio scrubbing — don't cache those) */
async function cacheFirstThenNetwork(request, cacheName) {
  /* Range requests (scrubbing) must always go to network */
  if (request.headers.has('range')) {
    return fetch(request);
  }
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Audio unavailable offline.', { status: 503 });
  }
}

/* ── Message: force cache refresh from the app ──────────────────────── */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_AUDIO_CACHE') {
    caches.delete(AUDIO_CACHE).then(() =>
      event.source.postMessage('AUDIO_CACHE_CLEARED')
    );
  }
});
