'use client';

import { useEffect } from 'react';

/**
 * Service Worker registration and management
 * Enables offline caching and background sync
 */
export function ServiceWorkerManager() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.info('SW registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // New content is available
                      showUpdateAvailableNotification();
                    }
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.warn('SW registration failed: ', registrationError);
          });
      });

      // Listen for SW messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          // Handle cache update notifications
          console.info('Cache updated:', event.data.url);
        }
      });
    }
  }, []);

  const showUpdateAvailableNotification = () => {
    // Simple notification for now - could be enhanced with a toast component
    if (confirm('A new version is available. Would you like to refresh?')) {
      window.location.reload();
    }
  };

  return null; // This component doesn't render anything
}