// Graceland Royal Academy - Service Worker
// Enhanced PWA capabilities with offline support

const CACHE_NAME = 'gra-v1.0.0';
const STATIC_CACHE = 'gra-static-v1.0.0';
const DYNAMIC_CACHE = 'gra-dynamic-v1.0.0';

// Resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Dynamic resources that should be cached
const CACHE_ROUTES = [
  '/dashboard',
  '/results',
  '/analytics',
  '/profile',
  '/settings'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🚀 GRA Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 GRA Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Cache hit - return cached version
        if (cachedResponse) {
          console.log('📁 Serving from cache:', request.url);
          
          // Update cache in background for dynamic content
          if (CACHE_ROUTES.some(route => url.pathname.includes(route))) {
            fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(DYNAMIC_CACHE)
                    .then((cache) => {
                      cache.put(request, responseClone);
                    });
                }
              })
              .catch(() => {
                // Fail silently for background updates
              });
          }
          
          return cachedResponse;
        }

        // Cache miss - fetch from network
        console.log('🌐 Fetching from network:', request.url);
        
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              
              // Cache dynamic content
              if (CACHE_ROUTES.some(route => url.pathname.includes(route))) {
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
            }
            
            return response;
          })
          .catch((error) => {
            console.error('❌ Network request failed:', error);
            
            // Return offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/').then((fallback) => {
                return fallback || new Response('GRA is offline. Please check your connection.', {
                  status: 200,
                  headers: { 'Content-Type': 'text/html' }
                });
              });
            }
            
            // Return error for other requests
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-gra') {
    event.waitUntil(
      // Sync offline data when connection returns
      syncOfflineData()
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'GRA Notification';
  const options = {
    body: data.body || 'You have a new notification from Graceland Royal Academy',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    image: data.image,
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'gra-notification',
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    // Open or focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // If app is already open, focus it
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Otherwise open a new window
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('📨 Message received from main thread:', event.data);
  
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
        
      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

// Utility functions
async function syncOfflineData() {
  try {
    console.log('🔄 Syncing offline data...');
    
    // Get offline data from IndexedDB or localStorage
    const offlineData = await getOfflineData();
    
    if (offlineData && offlineData.length > 0) {
      // Send offline data to server
      for (const data of offlineData) {
        try {
          await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
        } catch (error) {
          console.error('Failed to sync data:', error);
        }
      }
      
      // Clear synced data
      await clearOfflineData();
      console.log('✅ Offline data synced successfully');
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

async function getOfflineData() {
  // Implement IndexedDB or localStorage retrieval
  // This is a placeholder for actual implementation
  return [];
}

async function clearOfflineData() {
  // Implement offline data clearing
  // This is a placeholder for actual implementation
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('🗑️ All caches cleared');
}

// Error handler
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection in SW:', event.reason);
});

console.log('🎓 Graceland Royal Academy Service Worker loaded successfully');