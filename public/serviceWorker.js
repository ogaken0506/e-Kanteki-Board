var CACHE_NAME  = "scoreboard-cache-v20250717-v2";
const SERVER_URL = "https://ko-wgaca.f5.si/scoreboard/";
var urlsToCache = [
    SERVER_URL + "index.html",
    SERVER_URL + "styles/index.css",
    SERVER_URL + "styles/sidebar.css",
    SERVER_URL + "styles/scoreboard.css",
    SERVER_URL + "styles/login.css",
    SERVER_URL + "styles/property.css",
    SERVER_URL + "favicon.ico",
    SERVER_URL + "favicon.svg",
    SERVER_URL + "img/192.png",
    SERVER_URL + "img/512.png",
    SERVER_URL + "img/circle.svg",
    SERVER_URL + "img/cross.svg",
    SERVER_URL + "img/triangle.svg",
    SERVER_URL + "img/web_light_sq_SI.svg",
    SERVER_URL + "bundle.js"
];

self.addEventListener('install', function(event) {
  console.log("[Service Worker] Install");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(
            function(cache){
              console.log("[Service Worker] Caching all: app shell and content");
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
  console.log(`[Service Worker] Fetched resource ${event.request.url}`);
    event.respondWith(
      caches.match(event.request)
        .then(
        function (response) {
            if (response) {
                return response;
            }
            return fetch(event.request);
        }).catch({
          function(error) {
            console.error("[Service Worker] Fetch failed:", error);
            throw error;
          }
        })
    );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});