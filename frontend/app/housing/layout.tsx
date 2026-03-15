import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Housing Market Statistics | Let\'s Talk Statistics',
  description: 'Comprehensive U.S. housing market data from Federal Reserve FRED database. Track homeownership rates, construction starts, home prices, vacancy rates, and mortgage trends with 60+ time-series covering decades of housing statistics.',
  keywords: [
    'housing statistics',
    'homeownership rates',
    'home prices',
    'housing construction starts',
    'mortgage rates',
    'housing market data',
    'vacancy rates',
    'housing affordability',
    'real estate statistics',
    'housing market trends',
    'FRED housing data',
    'housing policy analysis',
    'residential construction',
    'housing finance data'
  ],
  openGraph: {
    title: 'Housing Market Statistics | Let\'s Talk Statistics',
    description: 'Track U.S. housing market trends with Federal Reserve data including home prices, construction starts, homeownership rates, and mortgage statistics.',
    type: 'website',
    url: 'https://letstalkstatistics.com/housing',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-housing.png',
      width: 1200,
      height: 630,
      alt: 'Housing market statistics and real estate data analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Housing Market Statistics | Let\'s Talk Statistics',
    description: 'Track U.S. housing market trends with comprehensive Federal Reserve FRED data',
    images: ['/og-housing.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/housing'
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

export default function HousingLayout({
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
            name: 'U.S. Housing Market Statistics',
            description: 'Comprehensive housing market data from Federal Reserve FRED database including homeownership rates, construction starts, home prices, vacancy rates, mortgage rates, and housing finance indicators across decades of market activity.',
            url: 'https://letstalkstatistics.com/housing',
            keywords: [
              'housing statistics',
              'homeownership rates',
              'home prices',
              'housing construction',
              'mortgage rates',
              'housing market data'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Federal Reserve Economic Data (FRED)'
            },
            includedInDataCatalog: {
              '@type': 'DataCatalog',
              name: 'Federal Reserve Economic Data (FRED)'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://fred.stlouisfed.org'
            },
            temporalCoverage: '1960/2024',
            spatialCoverage: {
              '@type': 'Place',
              name: 'United States'
            },
            variableMeasured: [
              'Homeownership Rate',
              'Housing Starts',
              'New Home Sales',
              'Existing Home Sales',
              'Median Home Prices',
              'Housing Vacancy Rates',
              '30-Year Fixed Mortgage Rates',
              'Housing Affordability Index'
            ]
          })
        }}
      />
      {children}
    </>
  );
}
