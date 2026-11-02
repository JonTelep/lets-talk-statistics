import type { Metadata } from 'next';
import ChartSection from '@/components/charts/ChartSection';
import ChartDatasets from '@/components/seo/ChartDatasets';
import { chartsFor } from '@/lib/site';

const title = 'Prices and inflation';
const description = 'CPI-U all items, the 12-month percent change, five CPI-U components on a shared base, and the median sales price of new houses.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/prices' },
  openGraph: {
    title,
    description,
    url: 'https://letstalkstatistics.com/prices',
    images: [{ url: '/charts/cpi-u-12-month-change.png', width: 1200, height: 675, alt: title }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/charts/cpi-u-12-month-change.png'] },
};

export default function PricesPage() {
  const charts = chartsFor('prices');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ChartDatasets charts={charts} />
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        Index values and prices published by the Bureau of Labor Statistics and the Census Bureau. Adjusted series state the price index and base year in the chart notes.
      </p>
      <div className="mt-8">
        <ChartSection charts={charts} />
      </div>
    </div>
  );
}
