import type { Series, SourceRecord } from '@/lib/site';

export function sourcesForSeries(series: Series, sources: SourceRecord[]): SourceRecord[] {
  const ids: string[] = [];
  const add = (id: string | undefined) => {
    if (id && !ids.includes(id)) ids.push(id);
  };
  if (series.source_ids) {
    for (const id of series.source_ids) add(id);
  }
  for (const point of series.points) add(point.locator?.source_id);
  add(series.source_id);
  return ids.flatMap((id) => {
    const source = sources.find((item) => item.id === id);
    return source ? [source] : [];
  });
}
