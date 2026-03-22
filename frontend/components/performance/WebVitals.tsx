'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

/**
 * Web Vitals monitoring component
 * Tracks Core Web Vitals for performance optimization
 */
export function WebVitals() {
  useEffect(() => {
    // Only track in production and with analytics consent
    if (process.env.NODE_ENV !== 'production') return;

    // Function to send metrics to analytics service
    function sendToAnalytics(metric: any) {
      // For now, just log to console in dev
      // In production, this could send to Google Analytics, Vercel Analytics, etc.
      console.info('Web Vital:', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });

      // Example: Send to Vercel Analytics
      // if (window.va) {
      //   window.va.track('Web Vital', {
      //     name: metric.name,
      //     value: metric.value,
      //     rating: metric.rating,
      //   });
      // }
    }

    // Track all Core Web Vitals
    onCLS(sendToAnalytics);  // Cumulative Layout Shift
    onINP(sendToAnalytics);  // Interaction to Next Paint (replaces FID)
    onFCP(sendToAnalytics);  // First Contentful Paint
    onLCP(sendToAnalytics);  // Largest Contentful Paint
    onTTFB(sendToAnalytics); // Time to First Byte
  }, []);

  return null; // This component doesn't render anything
}