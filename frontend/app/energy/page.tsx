import type { Metadata } from 'next';
import ChartSection from '@/components/charts/ChartSection';
import CountryEnergy from '@/components/energy/CountryEnergy';
import UsGenerationTable from '@/components/energy/UsGenerationTable';
import ChartDatasets from '@/components/seo/ChartDatasets';
import { formatRetrieved } from '@/lib/format';
import { chartsFor, seriesFor, site } from '@/lib/site';

const title = 'Energy';
const description = 'U.S. electricity net generation by source, and electricity net generation by country, from EIA and the World Bank.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/energy' },
  openGraph: {
    title,
    description,
    url: 'https://letstalkstatistics.com/energy',
    images: [{ url: '/charts/us-electricity-generation-shares.png', width: 1200, height: 675, alt: title }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/charts/us-electricity-generation-shares.png'] },
};

const SOURCE_IDS = ['eia_total_bulk', 'eia_intl_bulk', 'worldbank_sp_pop_totl'];

export default function EnergyPage() {
  const charts = chartsFor('energy');
  const shareCharts = charts.filter((chart) => chart.id === 'us-electricity-generation-shares');
  const byCode = new Map<
    string,
    {
      code: string;
      name: string;
      populationStatus?: string;
      generation?: (typeof charts)[number];
      perPerson?: (typeof charts)[number];
    }
  >();
  for (const chart of charts) {
    if (!chart.country_code || !chart.country_name) continue;
    const entry = byCode.get(chart.country_code) ?? {
      code: chart.country_code,
      name: chart.country_name,
    };
    if (chart.id.startsWith('electricity-per-person-')) entry.perPerson = chart;
    else entry.generation = chart;
    byCode.set(chart.country_code, entry);
  }
  const countries = Array.from(byCode.values())
    .flatMap((entry) => {
      if (!entry.generation) return [];
      const generationSeries = seriesFor(entry.generation);
      return [
        {
          code: entry.code,
          name: entry.name,
          populationStatus: generationSeries[0]?.population_status,
          generation: entry.generation,
          generationSeries,
          perPerson: entry.perPerson,
          perPersonSeries: entry.perPerson ? seriesFor(entry.perPerson) : [],
        },
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const cited = SOURCE_IDS.flatMap((id) => {
    const source = site.sources.find((item) => item.id === id);
    return source ? [source] : [];
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ChartDatasets charts={shareCharts} />
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        Electricity net generation for the United States by source, and electricity net generation by country.
        Each chart lists the publisher, the series, and the retrieval date.
      </p>

      <section className="mt-10">
        <UsGenerationTable />
        <div className="mt-8">
          <ChartSection charts={shareCharts} />
        </div>
      </section>

      <section className="mt-12">
        <h2>Electricity generation by country</h2>
        <p className="mt-4 max-w-3xl">
          Generation is EIA international net generation. Kilowatthours per person use that generation and World Bank
          midyear population for the same country code. Country names are the EIA series names.
        </p>
        <div className="mt-6">
          <CountryEnergy
            countries={countries}
            terms={site.presidents.terms}
            presidentNote={site.presidents.note}
            sources={site.sources}
          />
        </div>
      </section>

      <section className="mt-12">
        <h2>Sources</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {cited.map((source) => (
            <li key={source.id}>
              {source.publisher}, {source.title}. Retrieved {formatRetrieved(source.retrieved_at)}.{' '}
              <a className="text-accent hover:underline" href={source.series_url || source.url}>
                {(source.series_url || source.url).replace(/^https?:\/\//, '')}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
