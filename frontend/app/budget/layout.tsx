import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Federal Budget Breakdown | Let\'s Talk Statistics',
  description: 'Analyze the US federal budget with detailed breakdowns of spending, revenue, and deficits. See where your tax dollars go with official Treasury data.',
  keywords: ['federal budget', 'government spending', 'tax revenue', 'budget deficit', 'fiscal policy', 'Treasury data'],
  openGraph: {
    title: 'US Federal Budget Dashboard',
    description: 'Where does the federal government spend money? Explore spending, revenue, and deficit data.',
    type: 'website',
    images: [
      {
        url: '/og-budget.png',
        width: 1200,
        height: 630,
        alt: 'US Federal Budget Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Federal Budget Breakdown',
    description: 'See where your tax dollars go - federal spending and revenue analysis.',
  },
};

export default function BudgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
