import type { Metadata } from 'next';
import EducationPageContent from './EducationPageContent';

export const metadata: Metadata = {
  title: 'US Education Statistics | Enrollment, Spending & Outcomes',
  description: 'Comprehensive US education data analysis. Track enrollment trends, federal education spending, graduation rates, and post-graduation employment outcomes from Department of Education data.',
  keywords: ['education statistics', 'enrollment data', 'federal education spending', 'graduation rates', 'student outcomes', 'higher education data', 'Department of Education statistics'],
  openGraph: {
    title: 'US Education Statistics | Enrollment & Outcomes Data',
    description: 'Track US education enrollment, federal spending, graduation rates, and employment outcomes. Data from the Department of Education.',
    url: 'https://letstalkstatistics.com/education',
    images: [
      {
        url: '/og-education.png',
        width: 1200,
        height: 630,
        alt: 'US Education Statistics Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Education Statistics | Enrollment & Outcomes',
    description: 'Comprehensive analysis of US education enrollment, spending, and outcomes.',
    images: ['/og-education.png'],
  },
};

export default function EducationPage() {
  return <EducationPageContent />;
}