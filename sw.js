var staticCacheName = 'mws-static-v1';

let urlsToCache = [
    '/',
    '/js/main.js',
    '/js/restaurant_info.js',
    'js/dbhelper.js',
    '/css/styles.css',
    'js/lib/idb.js',
    '/restaurant.html'
  ];


self.addEventListener('install', function(event) {

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
        return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('mws') &&
            cacheName != staticCacheName;
        }).map(function(cacheName) {
            return cache.delete(cacheName);
        })

      );
    })


  );
});


self.addEventListener('fetch', function(event) {

  event.respondWith(
    caches.match(event.request).then(function(response) {
        if(response) return response;

        return fetch(event.request).then(function(response) {
            if (response.status === 404) {
            return new Response('Page not Found');
          }

          return caches.open(staticCacheName).then(function(cache) {
            cache.put(event.request.url, response.clone());
            return response;
          });
        });
    }).catch(function(err) {
        console.log('Error', err);
    })
  );

});