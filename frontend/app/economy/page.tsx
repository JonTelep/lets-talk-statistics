import type { Metadata } from 'next';
import ChartSection from '@/components/charts/ChartSection';
import ChartDatasets from '@/components/seo/ChartDatasets';
import { chartsFor } from '@/lib/site';

const title = 'Economy and wages';
const description = 'Average hourly earnings, the unemployment rate, median household income, and gross domestic product from BLS, Census, and BEA.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/economy' },
  openGraph: {
    title,
    description,
    url: 'https://letstalkstatistics.com/economy',
    images: [{ url: '/charts/unemployment-rate.png', width: 1200, height: 675, alt: title }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/charts/unemployment-rate.png'] },
};

export default function EconomyPage() {
  const charts = chartsFor('economy');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ChartDatasets charts={charts} />
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        Nominal and inflation-adjusted series are separate lines. The chart note states whether the adjustment is published by the source or calculated from CPI-U.
      </p>
      <div className="mt-8">
        <ChartSection charts={charts} />
      </div>
    </div>
  );
}
