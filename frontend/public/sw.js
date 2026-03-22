// Service Worker for Let's Talk Statistics
// Provides offline caching for API responses and static assets

const CACHE_NAME = 'lts-v1.0.0';
const API_CACHE_NAME = 'lts-api-v1.0.0';

// Cache static assets
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/_next/static/css/app.css',
  // Add other critical assets
];

// API endpoints to cache (government data doesn't change frequently)
const CACHE_API_PATTERNS = [
  /\/api\/v1\/budget\//,
  /\/api\/v1\/debt\//,
  /\/api\/v1\/employment\//,
  /\/api\/v1\/healthcare\//,
  /\/api\/v1\/education\//,
  /\/api\/v1\/congress\//,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with stale-while-revalidate strategy
  if (CACHE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        
        // Fetch fresh data in the background
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        });
        
        // Return cached data immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request).then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
    );
  }
});

// Handle background sync for offline analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-analytics') {
    event.waitUntil(sendStoredAnalytics());
  }
});

// Store analytics data when offline
function sendStoredAnalytics() {
  // Implementation for sending stored analytics when back online
  return Promise.resolve();
}