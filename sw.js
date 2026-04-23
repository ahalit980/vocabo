const CACHE_NAME = 'vocabo-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://unpkg.com/mqtt/dist/mqtt.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.filter(url => url.startsWith('./')));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => cached))
  );
});

// Kelime bildirimleri için mesaj dinleyicisi
let notifyInterval = null;
let notifyCards = [];
let notifyIndex = 0;

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'START_NOTIFY') {
    notifyCards = event.data.cards;
    notifyIndex = 0;
    if (notifyInterval) clearInterval(notifyInterval);

    notifyInterval = setInterval(() => {
      if (notifyCards.length === 0) return;
      if (notifyIndex >= notifyCards.length) notifyIndex = 0;
      const card = notifyCards[notifyIndex];
      self.registration.showNotification('Tekrar Vakti 🧠', {
        body: card.word.toUpperCase() + ' = ' + card.meaning,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        vibrate: [200, 100, 200]
      });
      notifyIndex++;
    }, 300000); // 5 dakika
  }

  if (event.data && event.data.type === 'STOP_NOTIFY') {
    if (notifyInterval) { clearInterval(notifyInterval); notifyInterval = null; }
  }
});
