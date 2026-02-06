import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employment Statistics | Let\'s Talk Statistics',
  description: 'Explore US employment data from the Bureau of Labor Statistics. View unemployment rates, job creation trends, and labor force participation by sector.',
  keywords: ['employment statistics', 'unemployment rate', 'BLS data', 'job market', 'labor statistics', 'workforce'],
  openGraph: {
    title: 'US Employment Statistics Dashboard',
    description: 'Official BLS employment data: unemployment rates, job creation, and labor force trends.',
    type: 'website',
    images: [
      {
        url: '/og-employment.png',
        width: 1200,
        height: 630,
        alt: 'US Employment Statistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Employment Statistics',
    description: 'Official unemployment and job market data from the Bureau of Labor Statistics.',
  },
};

export default function EmploymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
