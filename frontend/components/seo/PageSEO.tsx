'use client';

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
  const fullTitle = `${title} | Mission Control Data`;
  const fullUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `https://letstalkstatistics.com${ogImage}`;

  return (
    <>
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