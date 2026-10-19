import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ChartCard from '@/components/charts/ChartCard';
import ChartDatasets from '@/components/seo/ChartDatasets';
import { seriesFor, site } from '@/lib/site';

const PAGE_NAME: Record<string, string> = {
  prices: 'Prices and inflation',
  budget: 'Federal budget and debt',
  economy: 'Economy and wages',
  immigration: 'Immigration',
};

export function generateStaticParams() {
  return site.charts.map((chart) => ({ id: chart.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const chart = site.charts.find((item) => item.id === id);
  if (!chart) return { title: 'Chart' };
  const description = chart.notes;
  const image = `/charts/${chart.id}.png`;
  return {
    title: chart.title,
    description,
    alternates: { canonical: `https://letstalkstatistics.com/c/${chart.id}` },
    openGraph: {
      title: chart.title,
      description,
      url: `https://letstalkstatistics.com/c/${chart.id}`,
      images: [{ url: image, width: 1200, height: 675, alt: chart.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: chart.title,
      description,
      images: [image],
    },
  };
}

export default async function ChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const chart = site.charts.find((item) => item.id === id);
  if (!chart) notFound();
  const series = seriesFor(chart);
  const parent = PAGE_NAME[chart.page] ? `/${chart.page}` : '/';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ChartDatasets charts={[chart]} />
      <p className="mb-6 text-sm">
        <Link href={parent} className="text-accent hover:underline">
          {PAGE_NAME[chart.page] ?? 'Home'}
        </Link>
      </p>
      <ChartCard
        chart={chart}
        series={series}
        terms={site.presidents.terms}
        presidentNote={site.presidents.note}
        permalink
      />
    </div>
  );
}
