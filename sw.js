let intervalId = null;
let cards =[];
let index = 0;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'START') {
        cards = event.data.cards;
        index = 0;

        if (intervalId) clearInterval(intervalId);

        // 2 Dakikada bir (120.000 milisaniye) çalışacak döngü
        intervalId = setInterval(async () => {
            if (cards.length === 0) return;
            if (index >= cards.length) index = 0;

            const card = cards[index];
            
            // Telefona sistem bildirimi at
            self.registration.showNotification("Tekrar Vakti 🧠", {
                body: card.word.toUpperCase() + " = " + card.meaning,
                icon: "icon-192.png", 
                vibrate:[200, 100, 200, 100, 200], // Titreşim deseni
                tag: 'ducards-notification',
                renotify: true
            });
            
            // Açık olan uygulamaya (index.html) sesi okuması için mesaj gönder
            const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            windowClients.forEach(client => {
                client.postMessage({ type: 'SPEAK', word: card.word });
            });
            
            index++;
        }, 120000); // 120.000 ms = 2 Dakika

    } else if (event.data && event.data.type === 'STOP') {
        if (intervalId) clearInterval(intervalId);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            if (windowClients.length > 0) {
                windowClients[0].focus();
            } else {
                clients.openWindow('/');
            }
        })
    );
});