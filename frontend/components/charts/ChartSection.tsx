import ChartCard from '@/components/charts/ChartCard';
import { seriesFor, site, type ChartSpec } from '@/lib/site';

export default function ChartSection({ charts }: { charts: ChartSpec[] }) {
  return (
    <div className="space-y-8">
      {charts.map((chart) => (
        <ChartCard
          key={chart.id}
          chart={chart}
          series={seriesFor(chart)}
          terms={site.presidents.terms}
          presidentNote={site.presidents.note}
          sources={site.sources}
        />
      ))}
    </div>
  );
}
