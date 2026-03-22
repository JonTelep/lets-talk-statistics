'use client';

import Head from 'next/head';

/**
 * Preload critical resources for better performance
 * Preloads API endpoints that are likely to be needed soon
 */
interface ResourcePreloadProps {
  endpoints?: string[];
}

export function ResourcePreload({ endpoints = [] }: ResourcePreloadProps) {
  const defaultEndpoints = [
    '/api/v1/budget/current',
    '/api/v1/debt/current', 
    '/api/v1/employment/current'
  ];

  const preloadEndpoints = [...defaultEndpoints, ...endpoints];

  return (
    <Head>
      {/* Preload critical API endpoints */}
      {preloadEndpoints.map((endpoint) => (
        <link
          key={endpoint}
          rel="preload"
          href={endpoint}
          as="fetch"
          crossOrigin="anonymous"
        />
      ))}
      
      {/* Preload critical fonts (if using custom fonts) */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* DNS prefetch for external domains */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    </Head>
  );
}