import { seriesFor, sourceFor, type ChartSpec } from '@/lib/site';

export default function ChartDatasets({ charts }: { charts: ChartSpec[] }) {
  const graph = charts.map((chart) => {
    const series = seriesFor(chart);
    const dates = series.flatMap((item) => item.points.map((point) => point.date)).sort();
    const creators = Array.from(
      new Map(
        series
          .map((item) => sourceFor(item))
          .filter((source): source is NonNullable<typeof source> => Boolean(source))
          .map((source) => [source.publisher, source])
      ).values()
    );
    return {
      '@type': 'Dataset',
      name: chart.title,
      description: chart.notes,
      url: `https://letstalkstatistics.com/c/${chart.id}`,
      isAccessibleForFree: true,
      spatialCoverage: { '@type': 'Place', name: 'United States' },
      temporalCoverage: dates.length ? `${dates[0]}/${dates[dates.length - 1]}` : undefined,
      creator: creators.map((source) => ({
        '@type': 'Organization',
        name: source.publisher,
        url: source.url,
      })),
      distribution: series.map((item) => ({
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: item.series_url,
        name: item.name,
      })),
      dateModified: creators[0]?.retrieved_at,
    };
  });

  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }} />
  );
}
