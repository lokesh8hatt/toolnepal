const CACHE_NAME = "toolnepal-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./tools.html",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/js/tools.js",
  "./assets/img/logo.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
