import type { Series } from '@/lib/site';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ADJUSTMENT_LABELS: Record<string, string> = {
  'inflation-adjusted': 'Inflation-adjusted',
  nominal: 'Nominal',
  index: 'Index',
  'percent change': 'Percent change',
  rate: 'Rate',
  share_of_gdp: 'Share of GDP',
  count: 'Count',
  generation: 'Generation',
  share: 'Share',
  ratio: 'Ratio',
};

function shortName(name: string): string {
  return name
    .replace(' in U.S. city average, all urban consumers, not seasonally adjusted', '')
    .replace(', total private, not seasonally adjusted', '')
    .replace(', total private, seasonally adjusted', '')
    .replace('(Seas) ', '');
}

export function lineLabel(name: string, units: string, series: Pick<Series, 'name'>[]): string {
  const base = shortName(name);
  const duplicates = series.filter((item) => shortName(item.name) === base).length;
  return duplicates > 1 ? `${base} (${units})` : base;
}

export function adjustmentLabel(value: string): string {
  return ADJUSTMENT_LABELS[value] ?? value.replaceAll('_', ' ');
}

export function formatRetrieved(retrievedAt: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(retrievedAt);
  return match ? match[1] : retrievedAt;
}

export function formatDateLabel(date: string, frequency: string): string {
  if (frequency === 'fiscal_year') return `FY ${date}`;
  const match = /^(\d{4})-(\d{2})$/.exec(date);
  if (frequency === 'monthly' && match) {
    const month = MONTHS[Number(match[2]) - 1];
    if (month) return `${month} ${match[1]}`;
  }
  return date;
}

export function formatExact(value: string): string {
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(value);
  if (!match) return value;
  const sign = match[1];
  const whole = match[2].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return match[3] === undefined ? `${sign}${whole}` : `${sign}${whole}.${match[3]}`;
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return '';
  const sign = value < 0 ? '-' : '';
  const absolute = Math.abs(value);
  const tiers: [number, string][] = [
    [1e12, 'T'],
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'k'],
  ];
  for (const [size, suffix] of tiers) {
    if (absolute >= size) {
      const scaled = absolute / size;
      const digits = scaled >= 100 ? 0 : 1;
      return `${sign}${scaled.toFixed(digits)}${suffix}`;
    }
  }
  return `${sign}${absolute.toFixed(1)}`;
}
