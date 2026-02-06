import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Let\'s Talk Statistics',
  description: 'Learn about Let\'s Talk Statistics - our mission to provide objective, nonpartisan analysis of government data from official sources.',
  keywords: ['about', 'mission', 'nonpartisan', 'objective data', 'government statistics'],
  openGraph: {
    title: 'About Let\'s Talk Statistics',
    description: 'Our mission: objective government data analysis without political spin.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'About Let\'s Talk Statistics',
    description: 'Objective government data analysis without political spin.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
