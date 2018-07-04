self.addEventListener('install', function(event) {

  let urlsToCache = [
    '/',
    '/js/main.js',
    '/js/restaurant_info.js',
    'js/dbhelper.js',
    '/css/styles.css',
    'data/restaurants.json',
    '/restaurant.html'

  ];


  event.waitUntil(
    caches.open('mws-static-v1').then(function(cache) {
        return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
    })
  );

});