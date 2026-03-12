import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Housing Statistics',
  description:
    'U.S. housing market data — homeownership rates, construction starts, home prices, vacancy rates, and mortgage rates from FRED. 60+ time-series covering decades of data.',
  openGraph: {
    title: 'Housing Statistics | Let\'s Talk Statistics',
    description:
      'Explore U.S. housing market data from official Federal Reserve sources — prices, construction, homeownership, and mortgage rates.',
  },
};

export default function HousingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
