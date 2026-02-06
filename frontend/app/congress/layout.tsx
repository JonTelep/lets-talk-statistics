import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Congressional Stock Trades | Let\'s Talk Statistics',
  description: 'Track stock trades made by members of Congress. View STOCK Act disclosures, trading patterns, and top traders with data from the Capitol Trades API.',
  keywords: ['congressional trades', 'STOCK Act', 'Congress stock', 'politician trades', 'Capitol Trades', 'congressional disclosure'],
  openGraph: {
    title: 'Congressional Stock Trading Dashboard',
    description: 'What stocks are Congress members trading? STOCK Act disclosure data and analysis.',
    type: 'website',
    images: [
      {
        url: '/og-congress.png',
        width: 1200,
        height: 630,
        alt: 'Congressional Stock Trading Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Congressional Stock Trades',
    description: 'Track what stocks Congress members are buying and selling.',
  },
};

export default function CongressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
