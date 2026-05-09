const CACHE = 'literacy-v1';
const SHELL = ['/', '/shelf', '/player', '/admin',
  '/src/styles/tokens.css', '/src/styles/noir.css'];

self.addEventListener('install', e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))));

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/audio')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener('activate', e =>
  e.waitUntil(navigator.storage?.persist?.()));
