import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Election Funding & Campaign Finance Data | Let\'s Talk Statistics',
  description: 'Track U.S. election campaign finance data from the FEC. Explore campaign funding, donation patterns, PAC contributions, ballot access barriers, and election transparency metrics.',
  keywords: [
    'election funding data',
    'campaign finance statistics',
    'FEC data',
    'presidential campaign funding',
    'election barriers',
    'third party challenges',
    'ballot access requirements',
    'campaign donations',
    'election transparency',
    'political funding analysis',
    'campaign receipts',
    'PAC contributions',
    'super PAC data',
    'election finance tracking',
    'donor analysis',
    'political money'
  ],
  openGraph: {
    title: 'Election Funding & Campaign Finance | Let\'s Talk Statistics',
    description: 'Track U.S. election campaign finance data, donation patterns, and electoral transparency with live FEC data analysis.',
    type: 'website',
    url: 'https://letstalkstatistics.com/elections',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-elections.png',
      width: 1200,
      height: 630,
      alt: 'Election funding dashboard and campaign finance data analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Election Funding & Campaign Finance | Let\'s Talk Statistics',
    description: 'Track live U.S. campaign finance data and explore electoral transparency metrics',
    images: ['/og-elections.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/elections'
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

export default function ElectionsLayout({
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
            name: 'U.S. Campaign Finance and Election Data',
            description: 'Comprehensive election funding and campaign finance data including candidate receipts, PAC contributions, donor patterns, and electoral transparency metrics from FEC records.',
            url: 'https://letstalkstatistics.com/elections',
            keywords: [
              'campaign finance',
              'election funding',
              'FEC data',
              'political donations',
              'electoral transparency',
              'ballot access'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'Federal Election Commission'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://api.open.fec.gov'
            },
            temporalCoverage: '1976/2024',
            spatialCoverage: {
              '@type': 'Place',
              name: 'United States'
            },
            variableMeasured: [
              'Campaign receipts',
              'Donation amounts',
              'PAC contributions',
              'Ballot access costs',
              'Electoral barriers'
            ]
          })
        }}
      />
      {children}
    </>
  );
}