import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Federal Budget Analysis | Let\'s Talk Statistics',
  description: 'Comprehensive U.S. federal budget data and analysis. Track government spending by department, program allocations, budget trends, and fiscal policy impacts with official Treasury data.',
  keywords: [
    'federal budget',
    'government spending',
    'budget analysis',
    'fiscal policy',
    'treasury data',
    'budget deficit',
    'government finances',
    'spending by department',
    'budget trends',
    'federal expenditures',
    'public spending',
    'budget transparency'
  ],
  openGraph: {
    title: 'Federal Budget Analysis | Let\'s Talk Statistics',
    description: 'Track U.S. federal budget trends, government spending by department, and fiscal policy impacts with live Treasury data.',
    type: 'website',
    url: 'https://letstalkstatistics.com/budget',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-budget.png',
      width: 1200,
      height: 630,
      alt: 'Federal budget statistics and government spending analysis'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Federal Budget Analysis | Let\'s Talk Statistics',
    description: 'Track U.S. federal budget trends and government spending with live Treasury data',
    images: ['/og-budget.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/budget'
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

export default function BudgetLayout({
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
            name: 'U.S. Federal Budget Data',
            description: 'Comprehensive federal budget data including spending by department, program allocations, budget trends, and fiscal policy analysis.',
            url: 'https://letstalkstatistics.com/budget',
            keywords: [
              'federal budget',
              'government spending',
              'budget analysis',
              'fiscal policy',
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