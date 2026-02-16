'use client';

interface StructuredDataProps {
  type?: 'WebSite' | 'WebPage' | 'Article' | 'Dataset';
  name: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  publisher?: {
    name: string;
    url: string;
    logo?: string;
  };
  keywords?: string[];
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  about?: string[];
}

export function StructuredData({
  type = 'WebPage',
  name,
  description,
  url,
  image = '/og-image.png',
  author = 'Telep IO Space Division',
  datePublished,
  dateModified,
  publisher = {
    name: "Let's Talk Statistics",
    url: 'https://letstalkstatistics.com',
    logo: 'https://letstalkstatistics.com/favicon.svg'
  },
  keywords = [],
  inLanguage = 'en-US',
  isAccessibleForFree = true,
  about = []
}: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    description,
    url,
    image: image.startsWith('http') ? image : `https://letstalkstatistics.com${image}`,
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher,
    inLanguage,
    isAccessibleForFree,
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(keywords.length > 0 && { keywords }),
    ...(about.length > 0 && { about }),
    
    // Additional context for government data
    ...(type === 'Dataset' && {
      '@type': ['Dataset', 'GovernmentData'],
      license: 'https://creativecommons.org/publicdomain/zero/1.0/',
      provider: {
        '@type': 'GovernmentOrganization',
        name: 'United States Government'
      },
      isBasedOn: 'Official Government Statistics',
      spatialCoverage: 'United States',
      temporalCoverage: '2020/2024'
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}