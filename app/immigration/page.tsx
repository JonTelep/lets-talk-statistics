import type { Metadata } from 'next';
import ImmigrationPageContent from './ImmigrationPageContent';

export const metadata: Metadata = {
  title: 'US Immigration Statistics | Admissions, Deportations & Asylum Data',
  description: 'Comprehensive US immigration data analysis. Track legal admissions, deportations, asylum cases, naturalization rates, and historical immigration trends from DHS data.',
  keywords: ['immigration statistics', 'visa admissions', 'deportation data', 'asylum cases', 'naturalization rates', 'immigration trends', 'DHS immigration data', 'legal immigration'],
  openGraph: {
    title: 'US Immigration Statistics | DHS Immigration Data',
    description: 'Track US legal admissions, deportations, asylum cases, and immigration trends. Data from the Department of Homeland Security.',
    url: 'https://letstalkstatistics.com/immigration',
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
    title: 'US Immigration Statistics | Admissions & Trends',
    description: 'Comprehensive analysis of US immigration admissions, deportations, and asylum data.',
    images: ['/og-immigration.png'],
  },
};

export default function ImmigrationPage() {
  return <ImmigrationPageContent />;
}