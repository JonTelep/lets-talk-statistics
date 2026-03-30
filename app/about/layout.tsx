import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Let\'s Talk Statistics',
  description: 'Learn about Let\'s Talk Statistics: our mission to make government data accessible, data sources, methodology, and commitment to presenting unbiased statistical information from official U.S. government sources.',
  keywords: [
    'government data',
    'data transparency',
    'open data',
    'government statistics',
    'data methodology',
    'public data',
    'statistical analysis',
    'data visualization',
    'government transparency',
    'civic data',
    'public information',
    'data journalism'
  ],
  openGraph: {
    title: 'About | Let\'s Talk Statistics',
    description: 'Making government data accessible to everyone. Learn about our mission, data sources, and methodology for presenting unbiased statistical information.',
    type: 'website',
    url: 'https://letstalkstatistics.com/about',
    siteName: 'Let\'s Talk Statistics',
    images: [{
      url: '/og-about.png',
      width: 1200,
      height: 630,
      alt: 'About Let\'s Talk Statistics - Government data made accessible'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | Let\'s Talk Statistics',
    description: 'Making government data accessible to everyone. Learn about our mission and methodology.',
    images: ['/og-about.png']
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com/about'
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

export default function AboutLayout({
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
            '@type': 'Organization',
            name: 'Let\'s Talk Statistics',
            description: 'A platform dedicated to making U.S. government statistics accessible and understandable for everyone through interactive data visualizations and analysis.',
            url: 'https://letstalkstatistics.com',
            sameAs: [
              'https://letstalkstatistics.com/about'
            ],
            foundingDate: '2024',
            mission: 'Making government data accessible and understandable for all citizens',
            areaServed: {
              '@type': 'Place',
              name: 'United States'
            },
            knowsAbout: [
              'Government Data',
              'Statistical Analysis',
              'Data Visualization',
              'Public Information',
              'Government Transparency'
            ]
          })
        }}
      />
      {children}
    </>
  );
}