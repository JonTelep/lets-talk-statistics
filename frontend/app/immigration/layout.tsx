import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'US Immigration Statistics | Let\'s Talk Statistics',
  description: 'Comprehensive U.S. immigration data analysis including legal admissions, deportations, asylum cases, naturalization rates, border crossings, and historical immigration trends from DHS and BTS data.',
  keywords: [
    'immigration statistics',
    'visa admissions',
    'deportation data',
    'asylum cases',
    'naturalization rates',
    'immigration trends',
    'DHS immigration data',
    'legal immigration',
    'border crossings',
    'immigration enforcement',
    'refugee admissions',
    'family reunification',
    'employment-based immigration',
    'diversity visa',
    'immigration demographics',
    'border security'
  ],
  openGraph: {
    title: 'US Immigration Statistics | Let\'s Talk Statistics',
    description: 'Track U.S. immigration trends including legal admissions, deportations, asylum cases, and border crossings with comprehensive DHS and BTS data analysis.',
    type: 'website',
    url: 'https://letstalkstatistics.com/immigration',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-immigration.png',
      width: 1200,
      height: 630,
      alt: 'US Immigration statistics dashboard and trend analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Immigration Statistics | Let\'s Talk Statistics',
    description: 'Comprehensive analysis of U.S. immigration admissions, deportations, and border data',
    images: ['/og-immigration.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/immigration'
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

export default function ImmigrationLayout({
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
            name: 'U.S. Immigration and Border Data',
            description: 'Comprehensive U.S. immigration data including legal admissions, deportations, asylum cases, naturalization statistics, border crossings, and immigration enforcement metrics from DHS and Bureau of Transportation Statistics.',
            url: 'https://letstalkstatistics.com/immigration',
            keywords: [
              'immigration statistics',
              'border crossings',
              'asylum data',
              'naturalization rates',
              'immigration enforcement',
              'visa admissions'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: [
              {
                '@type': 'Organization',
                name: 'Department of Homeland Security'
              },
              {
                '@type': 'Organization',
                name: 'Bureau of Transportation Statistics'
              }
            ],
            distribution: [
              {
                '@type': 'DataDownload',
                encodingFormat: 'application/json',
                contentUrl: 'https://www.dhs.gov/immigration-statistics'
              },
              {
                '@type': 'DataDownload',
                encodingFormat: 'application/json',
                contentUrl: 'https://www.bts.gov/topics/border-crossing'
              }
            ],
            temporalCoverage: '1980/2024',
            spatialCoverage: {
              '@type': 'Place',
              name: 'United States'
            },
            variableMeasured: [
              'Legal admissions',
              'Border crossings',
              'Asylum applications',
              'Naturalization rates',
              'Deportation numbers',
              'Immigration enforcement actions'
            ]
          })
        }}
      />
      {children}
    </>
  );
}