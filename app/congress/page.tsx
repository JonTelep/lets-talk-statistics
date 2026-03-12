import type { Metadata } from 'next';
import CongressPageContent from './CongressPageContent';

export const metadata: Metadata = {
  title: 'Congressional Stock Trades | Live Trading Activity',
  description: 'Track real-time congressional stock trading disclosures. View trades by senators and representatives, analyze trading patterns, and explore the most traded stocks by Congress members.',
  keywords: ['congressional trades', 'senate trades', 'house trades', 'congress stock trades', 'political stock trades', 'STOCK Act disclosures', 'politician trading'],
  openGraph: {
    title: 'Congressional Stock Trades | Real-Time Trading Activity',
    description: 'Live tracking of congressional stock trading disclosures from the House and Senate. Free API access available.',
    url: 'https://letstalkstatistics.com/congress',
    images: [
      {
        url: '/og-congress.png',
        width: 1200,
        height: 630,
        alt: 'Congressional Stock Trades Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Congressional Stock Trades | Real-Time Activity',
    description: 'Track real-time congressional stock trading disclosures and trading patterns.',
    images: ['/og-congress.png'],
  },
};

export default function CongressPage() {
  return <CongressPageContent />;
}