import type { Metadata } from 'next';
import ChartSection from '@/components/charts/ChartSection';
import ChartDatasets from '@/components/seo/ChartDatasets';
import { chartsFor } from '@/lib/site';

const title = 'Federal budget and debt';
const description = 'Treasury debt, monthly receipts and outlays, interest expense, and OMB historical tables in dollars and as a percent of GDP.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/budget' },
  openGraph: {
    title,
    description,
    url: 'https://letstalkstatistics.com/budget',
    images: [{ url: '/charts/debt-to-the-penny.png', width: 1200, height: 675, alt: title }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/charts/debt-to-the-penny.png'] },
};

export default function BudgetPage() {
  const charts = chartsFor('budget');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ChartDatasets charts={charts} />
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        Monthly Treasury figures are nominal dollars. OMB historical tables are fiscal years. A fiscal year starts on October 1 and can include two presidents.
      </p>
      <div className="mt-8">
        <ChartSection charts={charts} />
      </div>
    </div>
  );
}
