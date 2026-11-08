/* ZEST CENTER INFO – offline support. Pages load fresh when online, saved copy when offline. */
const C = 'zest-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'share-frame.jpg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const same = u.origin === location.origin;
  const img = u.pathname.includes('/storage/v1/object/public/') || u.pathname.includes('/rest/v1/posts');   // posters + posts (for offline)
  if (!same && !img) return;                                      // live data always from network
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('./'))));
});
