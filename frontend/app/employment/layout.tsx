import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employment Statistics | Let\'s Talk Statistics',
  description: 'U.S. employment data and labor market analysis from Bureau of Labor Statistics. Track unemployment rates, job growth, workforce participation, and economic indicators by state and sector.',
  keywords: [
    'employment statistics',
    'unemployment rate',
    'job growth',
    'labor market data',
    'workforce participation',
    'BLS data',
    'employment trends',
    'job market analysis',
    'labor force statistics',
    'economic indicators',
    'employment by sector',
    'jobs report'
  ],
  openGraph: {
    title: 'Employment Statistics | Let\'s Talk Statistics',
    description: 'Track U.S. employment trends, unemployment rates, and labor market indicators with official Bureau of Labor Statistics data.',
    type: 'website',
    url: 'https://letstalkstatistics.com/employment',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-employment.png',
      width: 1200,
      height: 630,
      alt: 'Employment statistics and labor market analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employment Statistics | Let\'s Talk Statistics',
    description: 'Track U.S. employment trends and labor market indicators with official BLS data',
    images: ['/og-employment.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/employment'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
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
            '@type': 'Dataset',
            name: 'U.S. Employment and Labor Statistics',
            description: 'Comprehensive employment data including unemployment rates, job growth, workforce participation rates, and labor market analysis by state and industry sector.',
            url: 'https://letstalkstatistics.com/employment',
            keywords: [
              'employment statistics',
              'unemployment rate',
              'job growth',
              'labor market data',
              'workforce participation'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'U.S. Bureau of Labor Statistics'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://api.bls.gov'
            },
            temporalCoverage: '1990/2024',
            spatialCoverage: {
              '@type': 'Place',
              name: 'United States'
            }
          })
        }}
      />
      {children}
    </>
  );
}