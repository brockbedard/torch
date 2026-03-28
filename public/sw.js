var CACHE_NAME = 'torch-v1';
var URLS_TO_CACHE = ['/', '/index.html'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request).then(function(fetchResponse) {
        // Cache new resources dynamically
        if (e.request.url.startsWith(self.location.origin)) {
          var responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(function() {
      // Offline fallback
      if (e.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// Clear old caches on activate
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
});
