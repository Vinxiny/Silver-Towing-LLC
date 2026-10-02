/* Silver Towing LLC — offline-first service worker */
const CACHE = "silver-tow-v1";

const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./sw.js",
  "./icons/logo.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch.png",
  "./photos/truck-branded.jpg",
  "./photos/jeep-flatbed.jpg",
  "./photos/gwagon.jpg",
  "./photos/escalade.jpg",
  "./photos/porsche.jpg",
  "./photos/rangerover.jpg",
  "./photos/bike.jpg",
  "./photos/excavator.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((res) => {
          if (res && res.status === 200 && event.request.url.startsWith(self.location.origin)) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return caches.match(event.request);
        });
    })
  );
});
