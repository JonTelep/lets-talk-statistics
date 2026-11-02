import type { Metadata } from 'next';
import Link from 'next/link';
import HeadlineCard from '@/components/home/HeadlineCard';
import { latestPoint, site, sourceFor } from '@/lib/site';

const description = 'Latest official figures for prices, the federal debt, unemployment, and household income, each with its government source.';

export const metadata: Metadata = {
  title: "Let's Talk Statistics",
  description,
  alternates: { canonical: 'https://letstalkstatistics.com' },
  openGraph: {
    title: "Let's Talk Statistics",
    description,
    url: 'https://letstalkstatistics.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Let's Talk Statistics" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Let's Talk Statistics",
    description,
    images: ['/og-image.png'],
  },
};

const HEADLINES = [
  {
    seriesId: 'cpi_u_all_items_12_month_change',
    href: '/prices#cpi-u-12-month-change',
  },
  {
    seriesId: 'treasury_debt_total_monthly',
    href: '/budget#debt-to-the-penny',
  },
  {
    seriesId: 'bls_lns14000000_monthly',
    href: '/economy#unemployment-rate',
  },
  {
    seriesId: 'census_median_income_adjusted',
    href: '/economy#median-household-income',
  },
];

const PAGES = [
  { href: '/prices', name: 'Prices and inflation', page: 'prices' },
  { href: '/budget', name: 'Federal budget and debt', page: 'budget' },
  { href: '/economy', name: 'Economy and wages', page: 'economy' },
  { href: '/energy', name: 'Energy', page: 'energy' },
  { href: '/crime', name: 'Crime', page: 'crime' },
  { href: '/immigration', name: 'Immigration', page: 'immigration' },
  { href: '/sources', name: 'Sources and methodology', page: 'sources' },
];

export default function HomePage() {
  const headlines = HEADLINES.flatMap((item) => {
    const series = site.series[item.seriesId];
    const latest = latestPoint(item.seriesId);
    if (!series || !latest) return [];
    return [{ ...item, series, source: sourceFor(series) }];
  });
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Let's Talk Statistics",
    url: 'https://letstalkstatistics.com',
    description,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <h1>Let&apos;s Talk Statistics</h1>
      <p className="mt-4 max-w-3xl text-base sm:text-lg">
        Charts of official U.S. government statistics. Retrieved {site.generated_at.slice(0, 10)}.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {headlines.map((item) => (
          <HeadlineCard
            key={item.seriesId}
            href={item.href}
            series={item.series}
            source={item.source}
            points={item.series.points}
          />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((page) => {
          const count = site.charts.filter((chart) => chart.page === page.page).length;
          return (
            <Link key={page.href} href={page.href} className="card card-hover p-4">
              <h2 className="text-lg">{page.name}</h2>
              <p className="mt-2 text-sm">
                {page.page === 'energy'
                  ? 'U.S. generation by source, and generation by country'
                  : count === 0
                    ? 'No chart in this build.'
                    : `${count} charts`}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
