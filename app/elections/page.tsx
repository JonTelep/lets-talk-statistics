import type { Metadata } from 'next';
import ElectionsPageContentWrapper from './ElectionsPageContent';

export const metadata: Metadata = {
  title: 'Election Funding & Campaign Finance Data | FEC Live Data',
  description: 'Track live U.S. election campaign finance data from FEC API. Explore campaign funding, ballot access barriers, third-party challenges, and systemic election issues.',
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
    'election finance tracking'
  ],
  openGraph: {
    title: 'Election Funding & Campaign Finance | Live FEC Data',
    description: 'Live tracking of U.S. election campaign finance data, ballot access barriers, and third-party electoral challenges.',
    url: 'https://letstalkstatistics.com/elections',
    images: [
      {
        url: '/og-elections.png',
        width: 1200,
        height: 630,
        alt: 'Election Funding Dashboard - Campaign Finance Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Election Funding & Campaign Finance | FEC Live Data',
    description: 'Track live U.S. campaign finance data and explore systemic barriers in electoral competition.',
    images: ['/og-elections.png'],
  },
};

export default function ElectionsPage() {
  return <ElectionsPageContentWrapper />;
}