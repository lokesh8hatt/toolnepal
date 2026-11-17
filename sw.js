/* ToolNepal service worker
   - Same-origin pages, CSS, JS and images: network first, so visitors always get
     the latest deploy; the cached copy is only used when offline.
   - Other origins (CDNs, fonts): not intercepted.
   Bump CACHE_VERSION when changing this file's caching rules. */
const CACHE_VERSION = "toolnepal-v2";
const PRECACHE = [
  "./",
  "./assets/css/style.css",
  "./assets/js/main.js",
  "./assets/js/tools.js",
  "./assets/img/logo.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheable(response) {
  // Never store redirects (e.g. /page.html → /page): browsers refuse them for navigations
  return response && response.ok && !response.redirected && response.type === "basic";
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isPage = req.mode === "navigate";

  // Network first for everything, so a new deploy shows up immediately;
  // the cache is only a fallback when the visitor is offline.
  event.respondWith(
    fetch(req)
      .then(res => {
        if (cacheable(res)) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || (isPage ? caches.match("./") : undefined)))
  );
});
