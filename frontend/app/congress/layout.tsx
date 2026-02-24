import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Congressional Stock Trading | STOCK Act Disclosures',
  description: 'Track stock trades made by members of Congress under the STOCK Act. Real-time data from House and Senate financial disclosures with trade amounts, dates, and original filing documents.',
  keywords: [
    'congressional stock trading',
    'STOCK Act',
    'congress trades',
    'political stock trading',
    'congressional disclosures',
    'house senate trading',
    'political transparency',
    'government ethics',
    'congressional finance'
  ],
  openGraph: {
    title: 'Congressional Stock Trading | Real-Time STOCK Act Data',
    description: 'Official Congressional trading data from House & Senate disclosures. Track politician stock trades, amounts, and timing with links to original documents.',
    url: 'https://letstalkstatistics.com/congress',
    siteName: "Let's Talk Statistics",
    images: [
      {
        url: 'https://letstalkstatistics.com/og-congress.png',
        width: 1200,
        height: 630,
        alt: 'Congressional Stock Trading Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Congressional Stock Trading | STOCK Act Disclosures',
    description: 'Real-time Congressional trading data from official House & Senate disclosures. Track politician stock trades with amounts and original documents.',
    images: ['https://letstalkstatistics.com/og-congress.png'],
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/congress',
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
  verification: {
    google: 'google-site-verification-token', // Jon can add the actual token later
  },
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
            '@type': 'WebPage',
            name: 'Congressional Stock Trading',
            description: 'Track stock trades made by members of Congress under the STOCK Act. Real-time data from House and Senate financial disclosures.',
            url: 'https://letstalkstatistics.com/congress',
            image: 'https://letstalkstatistics.com/og-congress.png',
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
              'Congressional Stock Trading',
              'STOCK Act Compliance',
              'Political Transparency',
              'Government Ethics',
              'Financial Disclosures'
            ],
            keywords: [
              'congressional trading',
              'STOCK Act',
              'political transparency',
              'government ethics',
              'congressional disclosures'
            ],
            mainEntity: {
              '@type': 'Dataset',
              name: 'Congressional Trading Data',
              description: 'Official stock trading disclosures from US House and Senate members',
              license: 'https://creativecommons.org/publicdomain/zero/1.0/',
              provider: {
                '@type': 'GovernmentOrganization',
                name: 'United States Congress'
              },
              spatialCoverage: 'United States',
              temporalCoverage: '2020/2024'
            }
          }, null, 2)
        }}
      />
      {children}
    </>
  );
}