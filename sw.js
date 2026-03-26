// ═══════════════════════════════════════════════════
//  FYLOX SERVICE WORKER — v1
//  Estrategia: Network First con fallback a caché
//  - Assets estáticos: cache-first (rápido)
//  - API calls: network-only (siempre datos frescos)
//  - Offline: muestra shell cacheada
// ═══════════════════════════════════════════════════

const CACHE_NAME    = 'fylox-v1';
const CACHE_TIMEOUT = 3000; // 3s antes de usar caché

// Archivos del shell — se cachean en el install
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/CSS/styles.css',
  '/js/fylox-storage.js',
  '/js/fylox-api.js',
  '/js/fylox-langs.js',
  '/js/fylox-i18n.js',
  '/js/fylox-ui.js',
  '/js/fylox-notifications.js',
  '/js/fylox-payments.js',
  '/js/fylox-earn.js',
  '/js/fylox-init.js',
  '/manifest.json',
];

// ── INSTALL — cachear shell ───────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE — limpiar caches viejas ─────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH — estrategia inteligente ───────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API calls → siempre red, nunca caché
  if (url.hostname.includes('onrender.com') ||
      url.hostname.includes('cloudinary.com') ||
      url.hostname.includes('minepi.com') ||
      url.hostname.includes('okx.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Assets estáticos (.js .css .png .woff) → cache-first
  if (/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // 3. Navegación (HTML) → network-first con fallback a shell
  if (event.request.mode === 'navigate') {
    event.respondWith(
      Promise.race([
        fetch(event.request),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), CACHE_TIMEOUT)
        ),
      ]).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 4. Default → network
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// ── BACKGROUND SYNC — reintentar pagos fallidos ──
self.addEventListener('sync', event => {
  if (event.tag === 'fylox-sync-payments') {
    console.log('[SW] Background sync: payments');
  }
});

// ── PUSH NOTIFICATIONS (futuro) ──────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Fylox', {
    body:  data.body  || '',
    icon:  '/assets/ICONOS/Fylox_icono_v2.png',
    badge: '/assets/ICONOS/Fylox_icono_v2.png',
    data:  data,
    vibrate: [100, 50, 100],
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
