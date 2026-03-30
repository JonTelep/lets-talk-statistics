import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'National Debt Tracker | Let\'s Talk Statistics',
  description: 'Real-time U.S. national debt tracking with historical trends, debt-to-GDP ratios, and fiscal analysis. Monitor federal debt levels, borrowing costs, and fiscal sustainability metrics.',
  keywords: [
    'national debt',
    'federal debt',
    'debt to GDP ratio',
    'government debt',
    'fiscal sustainability',
    'debt ceiling',
    'treasury debt',
    'deficit tracking',
    'debt analysis',
    'government borrowing',
    'fiscal responsibility',
    'debt trends'
  ],
  openGraph: {
    title: 'National Debt Tracker | Let\'s Talk Statistics',
    description: 'Track U.S. national debt levels, historical trends, and fiscal sustainability metrics with real-time Treasury data.',
    type: 'website',
    url: 'https://letstalkstatistics.com/debt',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-debt.png',
      width: 1200,
      height: 630,
      alt: 'National debt statistics and government fiscal analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'National Debt Tracker | Let\'s Talk Statistics',
    description: 'Track U.S. national debt levels and fiscal sustainability with real-time Treasury data',
    images: ['/og-debt.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/debt'
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
            '@type': 'Dataset',
            name: 'U.S. National Debt Data',
            description: 'Real-time and historical U.S. national debt data including debt levels, debt-to-GDP ratios, borrowing costs, and fiscal sustainability analysis.',
            url: 'https://letstalkstatistics.com/debt',
            keywords: [
              'national debt',
              'federal debt',
              'debt to GDP ratio',
              'fiscal sustainability',
              'treasury data'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'U.S. Department of Treasury'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://api.fiscaldata.treasury.gov'
            },
            temporalCoverage: '1970/2024',
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