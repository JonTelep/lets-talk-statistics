import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Healthcare Spending Data | Let\'s Talk Statistics',
  description: 'Comprehensive U.S. healthcare spending data from Medicaid.gov. Track DSH payments, provider spending, and state-by-state healthcare utilization patterns.',
  keywords: [
    'healthcare spending data',
    'medicaid data',
    'DSH payments',
    'disproportionate share hospital',
    'healthcare statistics',
    'hospital provider data',
    'medicaid utilization rates',
    'healthcare policy data',
    'government healthcare spending',
    'CMS data',
    'healthcare transparency'
  ],
  openGraph: {
    title: 'Healthcare Spending Data | Let\'s Talk Statistics',
    description: 'Track U.S. healthcare spending patterns, Medicaid provider payments, and state utilization rates with live government data.',
    type: 'website',
    url: 'https://letstalkstatistics.com/healthcare',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-healthcare.png',
      width: 1200,
      height: 630,
      alt: 'Healthcare spending statistics and government data'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Healthcare Spending Data | Let\'s Talk Statistics',
    description: 'Track U.S. healthcare spending patterns with live Medicaid.gov data',
    images: ['/og-healthcare.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/healthcare'
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

export default function HealthcareLayout({
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
            name: 'U.S. Healthcare Spending Data',
            description: 'Comprehensive healthcare spending data from Medicaid.gov including DSH payments, provider utilization, and state-by-state healthcare statistics.',
            url: 'https://letstalkstatistics.com/healthcare',
            keywords: [
              'healthcare spending',
              'medicaid data',
              'DSH payments',
              'hospital providers',
              'healthcare statistics'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'U.S. Department of Health and Human Services'
            },
            includedInDataCatalog: {
              '@type': 'DataCatalog',
              name: 'Medicaid.gov Open Data'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://data.medicaid.gov'
            },
            temporalCoverage: '2016/2024',
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