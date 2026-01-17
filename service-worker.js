const CACHE_NAME = 'powerfit-gym-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Service Worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Offline fallback for HTML pages
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Background Sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from PowerFit Gym!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('PowerFit Gym', options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync Contact Form Function
function syncContactForm() {
  return new Promise((resolve) => {
    // Get stored form data from IndexedDB
    const request = indexedDB.open('PowerFitGymDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['contactForms'], 'readonly');
      const store = transaction.objectStore('contactForms');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const forms = getAllRequest.result;
        
        // Process each form (in real app, send to server)
        forms.forEach((form) => {
          console.log('Syncing form:', form);
          // Here you would send the form data to your server
        });
        
        // Clear synced forms
        const deleteTransaction = db.transaction(['contactForms'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('contactForms');
        deleteStore.clear();
        
        resolve();
      };
    };
  });
}

// Cache strategies
const cacheStrategies = {
  // Cache first strategy for static assets
  cacheFirst: (request) => {
    return caches.match(request).then((response) => {
      return response || fetch(request);
    });
  },
  
  // Network first strategy for dynamic content
  networkFirst: (request) => {
    return fetch(request).then((response) => {
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
      return response;
    }).catch(() => {
      return caches.match(request);
    });
  },
  
  // Stale while revalidate strategy
  staleWhileRevalidate: (request) => {
    const cachedResponse = caches.match(request);
    const networkResponse = fetch(request).then((response) => {
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, response.clone());
      });
      return response;
    });
    
    return cachedResponse || networkResponse;
  }
};

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicSync', (event) => {
    if (event.tag === 'update-content') {
      event.waitUntil(updateContent());
    }
  });
}

// Update content function
function updateContent() {
  return caches.open(CACHE_NAME).then((cache) => {
    return cache.addAll(urlsToCache);
  });
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
