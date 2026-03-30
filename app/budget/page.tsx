import type { Metadata } from 'next';
import BudgetPageContentWrapper from './BudgetPageContent';

export const metadata: Metadata = {
  title: 'Federal Budget Data | Government Spending & Revenue Statistics',
  description: 'Track U.S. federal budget data — spending, revenue, deficit, and debt from Treasury Fiscal Data API. Live government budget statistics with historical trends and breakdowns.',
  keywords: [
    'federal budget data',
    'government spending',
    'budget deficit',
    'federal revenue',
    'treasury fiscal data',
    'government budget statistics',
    'federal outlays',
    'budget breakdown',
    'deficit spending',
    'fiscal policy data',
    'government receipts',
    'budget categories',
    'federal spending trends'
  ],
  openGraph: {
    title: 'Federal Budget Data | U.S. Government Spending Statistics',
    description: 'Live tracking of federal budget data — spending, revenue, deficit trends from official Treasury sources.',
    url: 'https://letstalkstatistics.com/budget',
    images: [
      {
        url: '/og-budget.png',
        width: 1200,
        height: 630,
        alt: 'Federal Budget Dashboard - Government Spending Data',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Federal Budget Data | Government Spending Statistics',
    description: 'Track live U.S. federal budget data with historical trends — spending, revenue, and deficit analysis.',
    images: ['/og-budget.png'],
  },
};

export default function BudgetPage() {
  return <BudgetPageContentWrapper />;
}