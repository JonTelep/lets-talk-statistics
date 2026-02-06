import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Immigration Statistics | Let\'s Talk Statistics',
  description: 'US immigration data including border crossings, visa statistics, and enforcement data. Official DHS and CBP statistics without political spin.',
  keywords: ['immigration statistics', 'border crossings', 'visa data', 'CBP data', 'DHS statistics', 'immigration trends'],
  openGraph: {
    title: 'US Immigration Statistics Dashboard',
    description: 'Border crossing data, visa statistics, and immigration trends from DHS and CBP.',
    type: 'website',
    images: [
      {
        url: '/og-immigration.png',
        width: 1200,
        height: 630,
        alt: 'US Immigration Statistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Immigration Statistics',
    description: 'Official immigration and border crossing data from DHS and CBP.',
  },
};

export default function ImmigrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
