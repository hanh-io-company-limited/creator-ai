// Creator AI Service Worker
const CACHE_NAME = 'creator-ai-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/scripts.js',
  '/manifest.json'
];

// Dynamic cache patterns
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /^https:\/\/cdnjs\.cloudflare\.com/
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Caching static resources');
        await cache.addAll(STATIC_CACHE_URLS);
        
        // Create offline page
        await cache.put(OFFLINE_URL, new Response(`
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Creator AI - Offline</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%);
                color: white; 
                text-align: center; 
                padding: 2rem; 
                margin: 0;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }
              .offline-icon { font-size: 4rem; margin-bottom: 1rem; }
              h1 { font-size: 2rem; margin-bottom: 1rem; }
              p { font-size: 1.1rem; opacity: 0.9; }
              .retry-btn {
                background: rgba(255,255,255,0.2);
                border: 2px solid white;
                color: white;
                padding: 1rem 2rem;
                border-radius: 0.5rem;
                cursor: pointer;
                font-size: 1rem;
                margin-top: 2rem;
                transition: all 0.3s;
              }
              .retry-btn:hover {
                background: rgba(255,255,255,0.3);
              }
            </style>
          </head>
          <body>
            <div class="offline-icon">📱</div>
            <h1>Creator AI - Chế độ Offline</h1>
            <p>Bạn đang offline. Một số tính năng có thể không khả dụng.</p>
            <p>Vui lòng kiểm tra kết nối internet và thử lại.</p>
            <button class="retry-btn" onclick="window.location.reload()">Thử lại</button>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        }));
        
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Install failed:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
        
        self.clients.claim();
      } catch (error) {
        console.error('[SW] Activate failed:', error);
      }
    })()
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Try to get from cache first
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Try to fetch from network
        const networkResponse = await fetch(event.request);
        
        // Cache successful responses
        if (networkResponse.status === 200) {
          // Check if we should cache this resource
          const shouldCache = STATIC_CACHE_URLS.includes(event.request.url) ||
                             DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(event.request.url));
          
          if (shouldCache) {
            console.log('[SW] Caching:', event.request.url);
            await cache.put(event.request, networkResponse.clone());
          }
        }
        
        return networkResponse;
      } catch (error) {
        console.log('[SW] Fetch failed, serving offline page:', error);
        
        // For navigation requests, serve offline page
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          return await cache.match(OFFLINE_URL);
        }
        
        // For other requests, return a simple offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'creator-ai-sync') {
    event.waitUntil(
      (async () => {
        try {
          // Sync pending data when online
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'BACKGROUND_SYNC',
              tag: event.tag
            });
          });
        } catch (error) {
          console.error('[SW] Background sync failed:', error);
        }
      })()
    );
  }
});

// Push notifications for processing updates
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: 'Your avatar processing is complete!',
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><circle cx='48' cy='48' r='40' fill='%238B5CF6'/><text x='48' y='60' text-anchor='middle' font-family='Arial' font-size='30' fill='white'>AI</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><circle cx='48' cy='48' r='40' fill='%238B5CF6'/><text x='48' y='60' text-anchor='middle' font-family='Arial' font-size='30' fill='white'>AI</text></svg>",
    vibrate: [200, 100, 200],
    data: {
      url: '/?section=avatar'
    },
    actions: [
      {
        action: 'view',
        title: 'View Result',
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' fill='white'/></svg>"
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data.url = data.url || options.data.url;
  }

  event.waitUntil(
    self.registration.showNotification('Creator AI', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(event.data.urls);
      })()
    );
  }
});

// Periodic background sync for automatic data sync
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'creator-ai-auto-sync') {
    event.waitUntil(
      (async () => {
        try {
          // Auto-sync data every few hours
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'AUTO_SYNC',
              tag: event.tag
            });
          });
        } catch (error) {
          console.error('[SW] Periodic sync failed:', error);
        }
      })()
    );
  }
});

// Handle app updates
self.addEventListener('appinstalled', (event) => {
  console.log('[SW] App installed');
  
  // Track installation
  self.registration.showNotification('Creator AI Installed', {
    body: 'Creator AI has been installed and is ready to use offline!',
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><circle cx='48' cy='48' r='40' fill='%238B5CF6'/><text x='48' y='60' text-anchor='middle' font-family='Arial' font-size='30' fill='white'>AI</text></svg>",
    badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><circle cx='48' cy='48' r='40' fill='%238B5CF6'/><text x='48' y='60' text-anchor='middle' font-family='Arial' font-size='30' fill='white'>AI</text></svg>",
    vibrate: [200, 100, 200]
  });
});

console.log('[SW] Service Worker loaded');