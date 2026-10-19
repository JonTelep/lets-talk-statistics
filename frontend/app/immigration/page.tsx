import type { Metadata } from 'next';
import ChartSection from '@/components/charts/ChartSection';
import ChartDatasets from '@/components/seo/ChartDatasets';
import TodoList from '@/components/status/TodoList';
import { chartsFor, site } from '@/lib/site';

const title = 'Immigration';
const description = 'Persons obtaining lawful permanent resident status from the DHS Yearbook, and monthly CBP nationwide encounters.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/immigration' },
  openGraph: {
    title,
    description,
    url: 'https://letstalkstatistics.com/immigration',
    images: [{ url: '/charts/lawful-permanent-residents.png', width: 1200, height: 675, alt: title }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/charts/lawful-permanent-residents.png'] },
};

export default function ImmigrationPage() {
  const charts = chartsFor('immigration');
  const items = site.todos.filter((item) => item.id === 'dhs' || item.id === 'cbp');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ChartDatasets charts={charts} />
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        {charts.length === 0
          ? 'No immigration count is shown on this page. The fetch records below are the reason.'
          : 'Lawful permanent residents are the fiscal year counts in DHS Yearbook Table 1. Nationwide encounters are the monthly sum of the CBP Encounter Count column. A dataset that is not parsed stays in the fetch record.'}
      </p>
      {charts.length > 0 && (
        <div className="mt-8">
          <ChartSection charts={charts} />
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-8">
          <TodoList items={items} />
        </div>
      )}
    </div>
  );
}
