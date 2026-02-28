import { JsonLd } from 'next/dist/lib/metadata/types/json-ld';

interface WebsiteStructuredDataProps {
  url?: string;
  name?: string;
  description?: string;
}

interface DatasetStructuredDataProps {
  name: string;
  description: string;
  url: string;
  creator?: string;
  datePublished?: string;
  keywords?: string[];
}

export function WebsiteStructuredData({ 
  url = 'https://letstalkstatistics.com',
  name = "Let's Talk Statistics",
  description = 'Objective analysis of US government statistics and data from official sources.'
}: WebsiteStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    description,
    url,
    publisher: {
      '@type': 'Organization',
      name: 'Telep IO',
      url: 'https://telep.io'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url + '?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function DatasetStructuredData({
  name,
  description,
  url,
  creator = "Let's Talk Statistics",
  datePublished = new Date().toISOString().split('T')[0],
  keywords = []
}: DatasetStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description,
    url,
    creator: {
      '@type': 'Organization',
      name: creator
    },
    publisher: {
      '@type': 'Organization',
      name: 'Telep IO',
      url: 'https://telep.io'
    },
    datePublished,
    keywords: keywords.join(', '),
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: url
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function GovernmentDataStructuredData({
  title,
  description,
  url,
  dataSource,
  lastUpdated
}: {
  title: string;
  description: string;
  url: string;
  dataSource: string;
  lastUpdated?: string;
}) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['Dataset', 'GovernmentService'],
    name: title,
    description,
    url,
    creator: {
      '@type': 'GovernmentOrganization',
      name: dataSource
    },
    publisher: {
      '@type': 'Organization',
      name: "Let's Talk Statistics",
      url: 'https://letstalkstatistics.com'
    },
    datePublished: lastUpdated || new Date().toISOString().split('T')[0],
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    audience: {
      '@type': 'Audience',
      audienceType: ['researchers', 'journalists', 'citizens', 'policymakers']
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}