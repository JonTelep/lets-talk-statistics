// Service Worker for Let's Talk Statistics
// Provides offline caching and performance optimization

const CACHE_NAME = 'lts-cache-v1';
const STATIC_CACHE_NAME = 'lts-static-v1';
const API_CACHE_NAME = 'lts-api-v1';

// Cache durations (in milliseconds)
const STATIC_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const CHART_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/debt',
  '/employment', 
  '/budget',
  '/congress',
  '/immigration',
  '/elections',
  '/about',
  '/offline',
  '/manifest.json'
];

// API endpoints that should be cached
const CACHEABLE_APIS = [
  '/api/v1/debt/',
  '/api/v1/employment/unemployment',
  '/api/v1/budget/',
  '/api/v1/congress/stats',
  '/api/v1/immigration/summary',
  '/api/v1/elections/population'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache core API responses
      caches.open(API_CACHE_NAME).then((cache) => {
        return Promise.all(
          CACHEABLE_APIS.map(async (endpoint) => {
            try {
              const response = await fetch(`${self.location.origin}${endpoint}`);
              if (response.ok) {
                return cache.put(endpoint, response.clone());
              }
            } catch (error) {
              console.log(`Failed to cache ${endpoint}:`, error);
            }
          })
        );
      })
    ]).then(() => {
      console.log('Service Worker: Cache installation complete');
      self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME && 
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - intercept network requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for our API)
  if (!url.origin.includes(self.location.origin) && !url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Check if this is an API request
        if (url.pathname.startsWith('/api/')) {
          return handleApiRequest(request);
        }
        
        // Check if this is a static asset
        if (isStaticAsset(url.pathname)) {
          return handleStaticAsset(request);
        }
        
        // For page routes, try cache first then network
        return handlePageRequest(request);
        
      } catch (error) {
        console.log('Service Worker fetch error:', error);
        
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/offline') || new Response('Offline');
        }
        
        return new Response('Network Error', { status: 503 });
      }
    })()
  );
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for API request:', url.pathname);
  }
  
  // Fallback to cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('Service Worker: Serving API from cache:', url.pathname);
    return cachedResponse;
  }
  
  // Return error response if no cache available
  return new Response(
    JSON.stringify({ error: 'Data temporarily unavailable' }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Check if cache is still fresh
    const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
    const isExpired = Date.now() - cacheTime.getTime() > STATIC_CACHE_DURATION;
    
    if (!isExpired) {
      return cachedResponse;
    }
  }
  
  // Fetch from network and update cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Add cache timestamp
      const responseWithTime = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'sw-cache-time': new Date().toISOString()
        }
      });
      
      cache.put(request, responseWithTime.clone());
      return responseWithTime;
    }
  } catch (error) {
    console.log('Network failed for static asset:', request.url);
  }
  
  // Fallback to stale cache
  return cachedResponse || new Response('Asset not available', { status: 404 });
}

// Handle page requests with cache-first for performance
async function handlePageRequest(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first for fast loading
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Serve from cache immediately
    fetchAndUpdateCache(request, cache);
    return cachedResponse;
  }
  
  // If not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('Network failed for page request:', request.url);
  }
  
  // Fallback to offline page
  return caches.match('/offline') || new Response('Page not available offline', { status: 503 });
}

// Background fetch to update cache
async function fetchAndUpdateCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silent fail for background updates
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  return pathname.startsWith('/_next/') || 
         pathname.startsWith('/images/') ||
         pathname.startsWith('/icons/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico');
}

// Background sync for offline data collection
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync any pending offline actions
      syncOfflineActions()
    );
  }
});

async function syncOfflineActions() {
  // Future: Handle any offline data collection or user interactions
  console.log('Service Worker: Background sync triggered');
}

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New government data available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'data-update'
  };
  
  event.waitUntil(
    self.registration.showNotification('Let\'s Talk Statistics', options)
  );
});