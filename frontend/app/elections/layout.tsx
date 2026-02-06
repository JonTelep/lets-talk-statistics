import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Election Data & Campaign Finance | Let\'s Talk Statistics',
  description: 'Explore US election data including campaign finance, voter turnout, and historical results. Official FEC data on political donations and spending.',
  keywords: ['election data', 'campaign finance', 'FEC data', 'voter turnout', 'political donations', 'election results'],
  openGraph: {
    title: 'US Election & Campaign Finance Dashboard',
    description: 'Campaign finance data, voter turnout, and election statistics from official sources.',
    type: 'website',
    images: [
      {
        url: '/og-elections.png',
        width: 1200,
        height: 630,
        alt: 'US Election Data Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Election & Campaign Finance Data',
    description: 'FEC campaign finance data and election statistics.',
  },
};

export default function ElectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
