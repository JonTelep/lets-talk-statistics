import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employment & Unemployment | US Labor Statistics',
  description: 'US employment and unemployment statistics from Bureau of Labor Statistics. Track unemployment rates, job growth, labor force participation with official BLS data and historical trends.',
  keywords: [
    'unemployment rate',
    'employment statistics',
    'labor statistics',
    'BLS data',
    'job market',
    'labor force participation',
    'employment trends',
    'jobs report',
    'economic indicators'
  ],
  openGraph: {
    title: 'US Employment & Unemployment | Bureau of Labor Statistics Data',
    description: 'Official US employment data from Bureau of Labor Statistics. Track unemployment rates, job growth, and labor market trends with real-time updates.',
    url: 'https://letstalkstatistics.com/employment',
    siteName: "Let's Talk Statistics",
    images: [
      {
        url: 'https://letstalkstatistics.com/og-employment.png',
        width: 1200,
        height: 630,
        alt: 'US Employment Statistics Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Employment & Unemployment | Labor Statistics',
    description: 'Official employment data from Bureau of Labor Statistics with unemployment rates and job market trends.',
    images: ['https://letstalkstatistics.com/og-employment.png'],
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/employment',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export default function EmploymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['WebPage', 'Dataset'],
            name: 'US Employment & Unemployment Statistics',
            description: 'US employment and unemployment statistics from Bureau of Labor Statistics with historical trends',
            url: 'https://letstalkstatistics.com/employment',
            image: 'https://letstalkstatistics.com/og-employment.png',
            publisher: {
              '@type': 'Organization',
              name: "Let's Talk Statistics",
              url: 'https://letstalkstatistics.com',
              logo: 'https://letstalkstatistics.com/favicon.svg'
            },
            author: {
              '@type': 'Organization',
              name: 'Telep IO'
            },
            inLanguage: 'en-US',
            isAccessibleForFree: true,
            about: [
              'Employment Statistics',
              'Unemployment Rate',
              'Labor Market',
              'Economic Indicators',
              'Job Market Trends'
            ],
            keywords: [
              'unemployment rate',
              'employment statistics',
              'BLS data',
              'labor market',
              'job growth'
            ],
            mainEntity: {
              '@type': 'Dataset',
              name: 'US Employment Data',
              description: 'Official US employment and unemployment statistics from Bureau of Labor Statistics',
              license: 'https://creativecommons.org/publicdomain/zero/1.0/',
              provider: {
                '@type': 'GovernmentOrganization',
                name: 'US Bureau of Labor Statistics'
              },
              spatialCoverage: 'United States',
              temporalCoverage: '2000/2024',
              distribution: {
                '@type': 'DataDownload',
                encodingFormat: 'application/json',
                contentUrl: 'https://api.bls.gov/publicAPI/v2/timeseries/data'
              }
            }
          }, null, 2)
        }}
      />
      {children}
    </>
  );
}