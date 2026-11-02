'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useShade } from '@/components/providers/ShadeProvider';
import { formatDateLabel, formatExact, lineLabel } from '@/lib/format';
import type { Series, Term } from '@/lib/site';

const SHARE_COLORS: Record<string, string> = {
  eia_us_share_coal: '#525252',
  eia_us_share_natural_gas: '#3b82f6',
  eia_us_share_nuclear: '#1e3a8a',
  eia_us_share_hydro: '#60a5fa',
  eia_us_share_wind: '#94a3b8',
  eia_us_share_solar: '#f59e0b',
  eia_us_share_petroleum: '#78716c',
  eia_us_share_other: '#d4d4d4',
};

const PARTY_FILL: Record<Term['party'], string> = {
  Democratic: 'rgba(37, 99, 235, 0.12)',
  Republican: 'rgba(220, 38, 38, 0.12)',
};

function anchorDate(date: string, shade: 'month' | 'calendar' | 'fiscal' | 'none'): string {
  if (shade === 'month') return `${date}-01`;
  if (shade === 'calendar') return `${date}-07-01`;
  const year = Number(date);
  return `${year - 1}-10-01`;
}

function presidentOn(date: string, shade: 'month' | 'calendar' | 'fiscal' | 'none', terms: Term[]): Term | undefined {
  if (shade === 'none') return undefined;
  const anchor = anchorDate(date, shade);
  return terms.find((term) => term.start <= anchor && (term.end === null || anchor < term.end));
}

export default function StackedShareChart({
  series,
  shade,
  frequency,
  terms,
}: {
  series: Series[];
  shade: 'month' | 'calendar' | 'fiscal' | 'none';
  frequency: string;
  terms: Term[];
}) {
  const { enabled } = useShade();
  const published = useMemo(() => {
    const lookup = new Map<string, Map<string, string>>();
    series.forEach((item) => {
      lookup.set(item.id, new Map(item.points.map((point) => [point.date, point.value])));
    });
    return lookup;
  }, [series]);

  const { rows, bands } = useMemo(() => {
    const dates = Array.from(new Set(series.flatMap((item) => item.points.map((point) => point.date)))).sort();
    const nextRows = dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      series.forEach((item) => {
        const value = published.get(item.id)?.get(date);
        row[item.id] = value === undefined ? null : Number(value);
      });
      return row;
    });
    const nextBands: { x1: string; x2: string; party: Term['party'] }[] = [];
    if (shade !== 'none') {
      dates.forEach((date) => {
        const term = presidentOn(date, shade, terms);
        if (!term) return;
        const last = nextBands[nextBands.length - 1];
        if (last && last.party === term.party) last.x2 = date;
        else nextBands.push({ x1: date, x2: date, party: term.party });
      });
    }
    return { rows: nextRows, bands: nextBands };
  }, [published, series, shade, terms]);

  const tickEvery = Math.max(1, Math.ceil(rows.length / 6));

  return (
    <div className="h-72 sm:h-96 w-full">
      <ResponsiveContainer key={enabled ? 'shade-on' : 'shade-off'} width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          {enabled &&
            bands.map((band) => (
              <ReferenceArea
                key={`${band.x1}-${band.x2}-${band.party}`}
                x1={band.x1}
                x2={band.x2}
                fill={PARTY_FILL[band.party]}
                strokeOpacity={0}
                ifOverflow="hidden"
              />
            ))}
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={(value) => formatDateLabel(String(value), frequency)}
            interval={tickEvery - 1}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={(value) => `${Number(value).toFixed(0)}`}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-900)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(value) => formatDateLabel(String(value), frequency)}
            formatter={(value, name, item) => {
              const date = String(item?.payload?.date ?? '');
              const seriesId = String(item?.dataKey ?? '');
              const stored = published.get(seriesId)?.get(date);
              if (stored === undefined) return [null, null];
              return [`${formatExact(stored)} percent`, String(name)];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((item) => (
            <Area
              key={item.id}
              type="monotone"
              dataKey={item.id}
              name={lineLabel(item.name, item.units, series)}
              stackId="share"
              stroke={SHARE_COLORS[item.id] ?? '#a3a3a3'}
              fill={SHARE_COLORS[item.id] ?? '#a3a3a3'}
              fillOpacity={0.85}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
