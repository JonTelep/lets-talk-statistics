import type { Metadata } from 'next';
import HealthcarePageContent from './HealthcarePageContent';

export const metadata: Metadata = {
  title: 'US Healthcare Statistics | Spending, Coverage & Outcomes',
  description: 'Comprehensive US healthcare data analysis. Track healthcare spending, insurance coverage rates, Medicare enrollment, Medicaid statistics, and health outcomes from CMS and CDC data.',
  keywords: ['healthcare statistics', 'healthcare spending', 'insurance coverage', 'Medicare data', 'Medicaid enrollment', 'health outcomes', 'CMS data', 'CDC statistics'],
  openGraph: {
    title: 'US Healthcare Statistics | Spending & Coverage Data',
    description: 'Track US healthcare spending, insurance coverage rates, and health outcomes. Data from CMS and CDC sources.',
    url: 'https://letstalkstatistics.com/healthcare',
    images: [
      {
        url: '/og-healthcare.png',
        width: 1200,
        height: 630,
        alt: 'US Healthcare Statistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Healthcare Statistics | Spending & Coverage',
    description: 'Comprehensive analysis of US healthcare spending, coverage, and outcomes.',
    images: ['/og-healthcare.png'],
  },
};

export default function HealthcarePage() {
  return <HealthcarePageContent />;
}