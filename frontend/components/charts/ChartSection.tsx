import ChartCard from '@/components/charts/ChartCard';
import { seriesFor, site, sourceFor, type ChartSpec } from '@/lib/site';

export default function ChartSection({ charts }: { charts: ChartSpec[] }) {
  return (
    <div className="space-y-8">
      {charts.map((chart) => {
        const series = seriesFor(chart);
        const sources = Array.from(
          new Map(
            series
              .map((item) => sourceFor(item))
              .filter((source): source is NonNullable<typeof source> => Boolean(source))
              .map((source) => [source.id, source])
          ).values()
        );
        return (
          <ChartCard
            key={chart.id}
            chart={chart}
            series={series}
            sources={sources}
            terms={site.presidents.terms}
            presidentNote={site.presidents.note}
          />
        );
      })}
    </div>
  );
}
