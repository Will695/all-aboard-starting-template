// Service worker for the new starter app.
// Its job in this demo is to show system notifications (needed on phones, where a page cannot
// show one by itself) and to bring the app to the right page when a notification is tapped.
// A push server can be added later: its messages would arrive in the 'push' handler below.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  event.waitUntil(self.registration.showNotification(data.title || 'New Starter Journey', {
    body: data.body || '',
    icon: 'brand/icon-192.png',
    badge: 'brand/icon-192.png',
    data: { url: data.url || '#/home' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '#/home';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const page = list.find((c) => c.url.indexOf('index.html') !== -1) || list[0];
    if (page) {
      page.postMessage({ go: url });
      return page.focus();
    }
    return self.clients.openWindow('index.html' + url);
  }));
});
