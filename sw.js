const CACHE_NAME = 'sistema-rrhh-v35';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/css/tokens.css',
  '/css/reset.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/auth.css',
  '/css/print.css',
  '/js/main.js',
  '/js/constants.js',
  '/js/utils/pubsub.js',
  '/js/utils/format.js',
  '/js/utils/api-client.js',
  '/js/utils/file.js',
  '/js/engine/store.js',
  '/js/engine/vacaciones-calc.js',
  '/js/ui/auth.js',
  '/js/ui/sidebar.js',
  '/js/ui/app.js',
  '/js/ui/dashboard.js',
  '/js/ui/empleados.js',
  '/js/ui/empleado-detalle.js',
  '/js/ui/expedientes.js',
  '/js/ui/vacaciones.js',
  '/js/ui/constancias.js',
  '/js/ui/constancia-pdf.js',
  '/js/ui/constancia-membrete.js',
  '/js/ui/constancia-fonts.js',
  '/js/utils/numero-a-letras.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.url.includes('/api/') || request.url.includes('/v1/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
  } else {
    event.respondWith(
      fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
