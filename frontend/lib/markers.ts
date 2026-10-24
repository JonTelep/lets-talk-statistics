import type { Point } from '@/lib/site';

export type Marker = {
  date: string;
  value: string;
  kind: 'peak' | 'history' | 'latest';
};

export function markerPoints(points: Point[]): Marker[] {
  if (points.length === 0) return [];
  const latest = points.reduce((best, point) => (point.date > best.date ? point : best));
  const peakValue = points.reduce((max, point) => (Number(point.value) > max ? Number(point.value) : max), Number.NEGATIVE_INFINITY);
  const peak = points
    .filter((point) => Number(point.value) === peakValue)
    .reduce((best, point) => (point.date < best.date ? point : best));
  const history =
    points.find((point) => point.date === '1970') ??
    points
      .filter((point) => point.date >= '1960' && point.date <= '1979')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  const chosen: Marker[] = [];
  const seen = new Set<string>();
  for (const marker of [
    { kind: 'peak' as const, point: peak },
    { kind: 'history' as const, point: history },
    { kind: 'latest' as const, point: latest },
  ]) {
    if (!marker.point || seen.has(marker.point.date)) continue;
    seen.add(marker.point.date);
    chosen.push({ date: marker.point.date, value: marker.point.value, kind: marker.kind });
  }
  return chosen;
}
