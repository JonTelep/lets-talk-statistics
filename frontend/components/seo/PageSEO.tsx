'use client';

import Head from 'next/head';
import { StructuredData } from './StructuredData';

interface PageSEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noindex?: boolean;
  structured?: {
    type?: 'WebSite' | 'WebPage' | 'Article' | 'Dataset';
    datePublished?: string;
    dateModified?: string;
    keywords?: string[];
    about?: string[];
  };
}

export function PageSEO({
  title,
  description,
  canonicalUrl,
  keywords = [],
  ogImage = '/og-image.png',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  structured = {}
}: PageSEOProps) {
  const fullTitle = `${title} | Let's Talk Statistics`;
  const fullUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `https://letstalkstatistics.com${ogImage}`;

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {noindex && <meta name="robots" content="noindex,nofollow" />}

        {/* Open Graph Tags */}
        <meta property="og:type" content={ogType} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImageUrl} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:site_name" content="Let's Talk Statistics" />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImageUrl} />
        <meta name="twitter:site" content="@telep_io" />

        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Telep IO" />
        <meta name="generator" content="Next.js" />
      </Head>

      {/* Structured Data */}
      <StructuredData
        type={structured.type || 'WebPage'}
        name={title}
        description={description}
        url={fullUrl}
        image={ogImage}
        datePublished={structured.datePublished}
        dateModified={structured.dateModified}
        keywords={structured.keywords || keywords}
        about={structured.about}
      />
    </>
  );
}