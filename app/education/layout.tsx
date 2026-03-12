import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Education Statistics & Data | Let\'s Talk Statistics',
  description: 'Comprehensive U.S. education data from the Department of Education. Track enrollment, federal spending, graduation rates, and post-graduation earnings across higher education institutions.',
  keywords: [
    'education statistics',
    'college enrollment data',
    'education spending',
    'graduation rates',
    'student outcomes',
    'higher education data',
    'college scorecard',
    'department of education data',
    'federal education budget',
    'student earnings data',
    'education policy data',
    'university statistics'
  ],
  openGraph: {
    title: 'Education Statistics & Data | Let\'s Talk Statistics',
    description: 'Track U.S. education metrics including enrollment, federal spending, graduation rates, and post-graduation outcomes with live government data.',
    type: 'website',
    url: 'https://letstalkstatistics.com/education',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-education.png',
      width: 1200,
      height: 630,
      alt: 'Education statistics and government data'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Education Statistics & Data | Let\'s Talk Statistics',
    description: 'Track U.S. education metrics with live Department of Education data',
    images: ['/og-education.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/education'
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

export default function EducationLayout({
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
            name: 'U.S. Education Statistics',
            description: 'Comprehensive education data from the Department of Education including enrollment, spending, graduation rates, and post-graduation outcomes for higher education institutions.',
            url: 'https://letstalkstatistics.com/education',
            keywords: [
              'education statistics',
              'college enrollment',
              'graduation rates',
              'student outcomes',
              'education spending'
            ],
            creator: {
              '@type': 'Organization',
              name: 'Let\'s Talk Statistics'
            },
            publisher: {
              '@type': 'Organization',
              name: 'U.S. Department of Education'
            },
            includedInDataCatalog: {
              '@type': 'DataCatalog',
              name: 'College Scorecard Open Data'
            },
            distribution: {
              '@type': 'DataDownload',
              encodingFormat: 'application/json',
              contentUrl: 'https://api.data.gov/ed/collegescorecard'
            },
            temporalCoverage: '2010/2024',
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