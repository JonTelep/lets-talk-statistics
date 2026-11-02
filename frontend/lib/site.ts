import raw from '../data/site.json';

export type Point = {
  date: string;
  value: string;
  locator?: Record<string, string>;
};

export type Series = {
  id: string;
  name: string;
  units: string;
  adjustment: string;
  nominal_or_real: string;
  frequency: string;
  source_id: string;
  series_url: string;
  points: Point[];
  notes?: string;
  bls_series_id?: string;
  derived?: boolean;
  inputs?: string[];
  base_year?: string;
  published_units?: string;
};

export type ChartSpec = {
  id: string;
  title: string;
  page: string;
  frequency: string;
  shade: 'month' | 'calendar' | 'fiscal';
  series: string[];
  notes: string;
};

export type SourceRecord = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  retrieved_at: string;
  sha256: string;
  series_url?: string;
};

export type Term = {
  name: string;
  party: 'Democratic' | 'Republican';
  start: string;
  end: string | null;
};

export type TodoRecord = {
  id: string;
  dataset: string;
  url?: string;
  reason: string;
};

export type SiteData = {
  generated_at: string;
  presidents: {
    source_url: string;
    source_name: string;
    note: string;
    terms: Term[];
  };
  todos: TodoRecord[];
  sources: SourceRecord[];
  series: Record<string, Series>;
  charts: ChartSpec[];
};

export const site = raw as SiteData;

export function chartsFor(page: string): ChartSpec[] {
  return site.charts.filter((chart) => chart.page === page);
}

export function seriesFor(chart: ChartSpec): Series[] {
  return chart.series.flatMap((id) => {
    const series = site.series[id];
    return series ? [series] : [];
  });
}

export function sourceFor(series: Series): SourceRecord | undefined {
  return site.sources.find((source) => source.id === series.source_id);
}

export function sourcesFor(series: Series): SourceRecord[] {
  const ids: string[] = [];
  const add = (id: string | undefined) => {
    if (id && !ids.includes(id)) ids.push(id);
  };
  for (const point of series.points) add(point.locator?.source_id);
  add(series.source_id);
  return ids.flatMap((id) => {
    const source = site.sources.find((item) => item.id === id);
    return source ? [source] : [];
  });
}

export function latestPoint(seriesId: string): Point | undefined {
  const points = site.series[seriesId]?.points;
  if (!points || points.length === 0) return undefined;
  return points.reduce((latest, point) => (point.date > latest.date ? point : latest));
}
