'use client';

import { useEffect } from 'react';
import { initializeDataPreloading } from '@/services/cache/preloader';

/**
 * Provider component to initialize data preloading for performance optimization.
 * Runs cache warming strategies to improve perceived performance.
 */
export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize data preloading on mount
    initializeDataPreloading();
    
    // Optional: Add debugging in development
    if (process.env.NODE_ENV === 'development') {
      // Log cache stats after preloading has had time to work
      setTimeout(() => {
        const { getPreloaderStats } = require('@/services/cache/preloader');
        const stats = getPreloaderStats();
        if (stats) {
          console.log('[PreloaderProvider] Cache stats:', stats);
        }
      }, 5000);
    }
  }, []);

  return <>{children}</>;
}

export default PreloaderProvider;