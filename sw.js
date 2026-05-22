const CACHE_NAME = 'vmaster-billing-v14';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './css/print.css',
    './js/firebase-config.js',
    './js/db-schema.js',
    './js/i18n.js',
    './js/views.js',
    './js/pricing.js',
    './js/app.js',
    './js/pos.js',
    './js/purchase.js',
    './js/expenses.js',
    './js/reports.js',
    
    // CDN Assets
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore-compat.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js'
];

// Install Event - cache core shell assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Pre-caching offline shell assets...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - clean up legacy caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[Service Worker] Cleaning legacy cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - network-first fallback to cache
self.addEventListener('fetch', event => {
    // Only handle GET HTTP/S requests (skip POST, PUT, etc. and non-http protocols)
    if (!event.request.url.startsWith('http')) return;
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If response is valid, clone and cache it dynamically
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // If offline, serve from cache immediately
                return caches.match(event.request);
            })
    );
});
