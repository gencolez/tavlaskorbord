
const CACHE_NAME = 'tavla-skorboard-v8.1'; // Versiyon numarasını değiştirdik
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  'https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/icon-192x192.png',
  'https://cdn.glitch.global/99d85125-6109-4370-a05e-21b4aeb697f9/icon-512x512.png'
];

// Kurulum aşaması - Uygulama dosyalarını önbelleğe alma
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Önbellekleme yapılıyor: ', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktifleşme aşaması - Eski cache'leri temizleme
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski önbellek temizleniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch aşaması - İstekler yapılırken cache kullanımı
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Önbellekte bulunan kaynak varsa onu döndür
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});