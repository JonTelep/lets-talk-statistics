import Link from 'next/link';
import Sparkline from '@/components/charts/Sparkline';
import { adjustmentLabel, formatDateLabel, formatExact, formatRetrieved } from '@/lib/format';
import type { Point, Series, SourceRecord } from '@/lib/site';

export default function HeadlineCard({
  href,
  series,
  source,
  points,
}: {
  href: string;
  series: Series;
  source?: SourceRecord;
  points: Point[];
}) {
  const latest = points[points.length - 1];
  return (
    <Link href={href} className="card card-hover block p-4 sm:p-5">
      <p className="data-label">{series.name}</p>
      <p className="data-value mt-3 text-2xl sm:text-3xl break-all">{formatExact(latest.value)}</p>
      <p className="mt-2 text-sm text-fg-secondary">
        {formatDateLabel(latest.date, series.frequency)}. {series.units}. {adjustmentLabel(series.nominal_or_real)}.
      </p>
      <div className="mt-3">
        <Sparkline points={points.slice(-120)} />
      </div>
      {source && (
        <p className="mt-2 text-xs text-fg-muted">
          {source.publisher}. Retrieved {formatRetrieved(source.retrieved_at)}.
        </p>
      )}
    </Link>
  );
}
