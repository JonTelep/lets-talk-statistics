import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'National Debt | US Federal Debt Statistics',
  description: 'Real-time US national debt tracking with historical data from Treasury Fiscal Data. Current debt levels, trends, and per-capita calculations with official government sources.',
  keywords: [
    'national debt',
    'federal debt',
    'US debt',
    'treasury data',
    'government spending',
    'fiscal responsibility',
    'debt ceiling',
    'public debt',
    'deficit spending'
  ],
  openGraph: {
    title: 'US National Debt | Real-Time Federal Debt Tracking',
    description: 'Official US national debt data from Treasury Fiscal Data. Track current debt levels, historical trends, and per-capita calculations with real-time updates.',
    url: 'https://letstalkstatistics.com/debt',
    siteName: "Let's Talk Statistics",
    images: [
      {
        url: 'https://letstalkstatistics.com/og-debt.png',
        width: 1200,
        height: 630,
        alt: 'US National Debt Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US National Debt | Real-Time Federal Debt Tracking',
    description: 'Official US national debt data from Treasury Fiscal Data with real-time updates and historical trends.',
    images: ['https://letstalkstatistics.com/og-debt.png'],
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/debt',
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

export default function DebtLayout({
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
            name: 'US National Debt Statistics',
            description: 'Real-time US national debt tracking with historical data from Treasury Fiscal Data',
            url: 'https://letstalkstatistics.com/debt',
            image: 'https://letstalkstatistics.com/og-debt.png',
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
              'National Debt',
              'Federal Spending',
              'Government Finance',
              'Treasury Data',
              'Fiscal Policy'
            ],
            keywords: [
              'national debt',
              'federal debt',
              'treasury data',
              'government spending',
              'fiscal policy'
            ],
            mainEntity: {
              '@type': 'Dataset',
              name: 'US National Debt Data',
              description: 'Official US national debt statistics from Treasury Fiscal Data API',
              license: 'https://creativecommons.org/publicdomain/zero/1.0/',
              provider: {
                '@type': 'GovernmentOrganization',
                name: 'US Department of the Treasury'
              },
              spatialCoverage: 'United States',
              temporalCoverage: '2000/2024',
              distribution: {
                '@type': 'DataDownload',
                encodingFormat: 'application/json',
                contentUrl: 'https://api.fiscaldata.treasury.gov/services/api/v1/accounting/od/debt_to_penny'
              }
            }
          }, null, 2)
        }}
      />
      {children}
    </>
  );
}