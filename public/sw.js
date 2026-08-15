const CACHE_NAME = 'aliexpress24-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Para requisições de navegação do browser (recarregar página/F5), usar network e fallback se necessário
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || fetch('/');
      })
    );
    return;
  }

  // Network first para todos os outros recursos
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
