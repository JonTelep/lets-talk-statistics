'use client';

import { useState } from 'react';
import Link from 'next/link';
import TimeChart from '@/components/charts/TimeChart';
import { useShade } from '@/components/providers/ShadeProvider';
import { adjustmentLabel, formatRetrieved, lineLabel } from '@/lib/format';
import type { ChartSpec, Series, SourceRecord, Term } from '@/lib/site';

export default function ChartCard({
  chart,
  series,
  sources,
  terms,
  presidentNote,
  permalink = false,
}: {
  chart: ChartSpec;
  series: Series[];
  sources: SourceRecord[];
  terms: Term[];
  presidentNote: string;
  permalink?: boolean;
}) {
  const { enabled, toggle } = useShade();
  const [copied, setCopied] = useState(false);
  const link = `https://letstalkstatistics.com/c/${chart.id}`;
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article id={chart.id} className="card p-4 sm:p-6 scroll-mt-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2>{chart.title}</h2>
          <p className="mt-2 text-sm">{chart.notes}</p>
        </div>
        <button type="button" onClick={toggle} className="btn-secondary shrink-0 text-xs" aria-pressed={enabled}>
          {enabled ? 'Hide president shading' : 'Show president shading'}
        </button>
      </div>

      {enabled && (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'rgba(37, 99, 235, 0.85)' }} />
            Democratic
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: 'rgba(220, 38, 38, 0.85)' }} />
            Republican
          </span>
        </div>
      )}

      <div className="mt-4">
        <TimeChart series={series} shade={chart.shade} frequency={chart.frequency} terms={terms} />
      </div>

      <p className="mt-4 text-xs text-fg-muted">{presidentNote}</p>

      <dl className="mt-4 space-y-3 text-sm">
        {series.map((item) => {
          const source = sourceById.get(item.source_id);
          return (
            <div key={item.id} className="border-t border-border pt-3">
              <dt className="text-foreground">{lineLabel(item.name, item.units, series)}</dt>
              <dd className="mt-1 text-fg-secondary">
                Units: {item.units}. {adjustmentLabel(item.nominal_or_real)}. {item.adjustment}.
                {item.published_units ? ` Published units: ${item.published_units}.` : ''}
              </dd>
              {item.notes && <dd className="mt-1 text-fg-muted">{item.notes}</dd>}
              {source && (
                <dd className="mt-1 text-fg-muted">
                  Source: {source.publisher}, {source.title}. Retrieved {formatRetrieved(source.retrieved_at)}. Series:{' '}
                  <a href={item.series_url} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    {item.series_url.replace(/^https?:\/\//, '')}
                  </a>
                </dd>
              )}
            </div>
          );
        })}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary text-xs" onClick={copyLink}>
          {copied ? 'Link copied' : 'Copy chart link'}
        </button>
        <a className="btn-secondary text-xs" href={`/charts/${chart.id}.png`} download={`${chart.id}.png`}>
          Chart image
        </a>
        {!permalink && (
          <Link className="btn-secondary text-xs" href={`/c/${chart.id}`}>
            Permalink
          </Link>
        )}
      </div>
    </article>
  );
}
