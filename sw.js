const CACHE_NAME = 'prayer-app-v2';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './data/prayers.js',
    './data/pesaha.js',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Return cached asset if found
            if (cachedResponse) {
                return cachedResponse;
            }
            // Otherwise try the network
            return fetch(event.request).catch(() => {
                // If offline and request fails
                console.log('Offline and resource not found in cache');
            });
        })
    );
});
