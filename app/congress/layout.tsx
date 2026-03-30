import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Congressional Stock Trades | Let\'s Talk Statistics',
  description: 'Track congressional stock trading activity with real-time data from the Capitol Trades API. Monitor politician trading patterns, disclosure compliance, and trading volumes by party and state.',
  keywords: [
    'congressional stock trades',
    'capitol trades',
    'politician trading',
    'stock act disclosures',
    'congressional transparency',
    'politician investments',
    'government trading data',
    'congress stock transactions',
    'political trading patterns',
    'congressional ethics',
    'trading transparency',
    'capitol trades API'
  ],
  openGraph: {
    title: 'Congressional Stock Trades | Let\'s Talk Statistics',
    description: 'Track congressional stock trading activity with real-time data. Monitor politician trading patterns and disclosure compliance across party lines.',
    type: 'website',
    url: 'https://letstalkstatistics.com/congress',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-congress.png',
      width: 1200,
      height: 630,
      alt: 'Congressional stock trading statistics and government transparency data'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Congressional Stock Trades | Let\'s Talk Statistics',
    description: 'Track congressional stock trading activity with real-time Capitol Trades API data',
    images: ['/og-congress.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/congress'
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

export default function CongressLayout({
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
            name: 'Congressional Stock Trading Data',
            description: 'Real-time congressional stock trading data including politician transactions, disclosure timing, trading volumes, and compliance with the STOCK Act.',
            url: 'https://letstalkstatistics.com/congress',
            keywords: [
              'congressional stock trades',
              'politician trading',
              'stock act disclosures',
              'government transparency',
              'trading patterns'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'U.S. House of Representatives'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://trades.telep.io'
            },
            temporalCoverage: '2016/2024',
            spatialCoverage: {
              '@type': 'Place',
              name: 'United States'
            },
            isPartOf: {
              '@type': 'Dataset',
              name: 'Capitol Trades API',
              description: 'Free API providing congressional stock trading data',
              url: 'https://trades.telep.io'
            }
          })
        }}
      />
      {children}
    </>
  );
}