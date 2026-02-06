import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'National Debt Dashboard | Let\'s Talk Statistics',
  description: 'Track the US national debt in real-time. View current debt levels, historical trends, debt holders breakdown, and debt-to-GDP ratios from official Treasury data.',
  keywords: ['national debt', 'US debt', 'federal debt', 'Treasury data', 'debt clock', 'debt history'],
  openGraph: {
    title: 'US National Debt Dashboard',
    description: 'Real-time tracking of the $36+ trillion national debt with historical data and analysis.',
    type: 'website',
    images: [
      {
        url: '/og-debt.png',
        width: 1200,
        height: 630,
        alt: 'US National Debt Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US National Debt Dashboard',
    description: 'Track the $36+ trillion national debt in real-time with historical trends.',
  },
};

export default function DebtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
