'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useShade } from '@/components/providers/ShadeProvider';
import { formatCompact, formatDateLabel, formatExact, lineLabel } from '@/lib/format';
import type { Series, Term } from '@/lib/site';

const LINE_COLORS = ['#3b82f6', '#d4d4d4', '#60a5fa', '#a3a3a3', '#93c5fd', '#737373'];

const PARTY_FILL: Record<Term['party'], string> = {
  Democratic: 'rgba(37, 99, 235, 0.12)',
  Republican: 'rgba(220, 38, 38, 0.12)',
};

function anchorDate(date: string, shade: 'month' | 'calendar' | 'fiscal'): string {
  if (shade === 'month') return `${date}-01`;
  if (shade === 'calendar') return `${date}-07-01`;
  const year = Number(date);
  return `${year - 1}-10-01`;
}

function presidentOn(date: string, shade: 'month' | 'calendar' | 'fiscal', terms: Term[]): Term | undefined {
  const anchor = anchorDate(date, shade);
  return terms.find((term) => term.start <= anchor && (term.end === null || anchor < term.end));
}

export default function TimeChart({
  series,
  shade,
  frequency,
  terms,
}: {
  series: Series[];
  shade: 'month' | 'calendar' | 'fiscal';
  frequency: string;
  terms: Term[];
}) {
  const { enabled } = useShade();
  const { rows, bands } = useMemo(() => {
    const maps = series.map((item) => new Map(item.points.map((point) => [point.date, Number(point.value)])));
    const dates = Array.from(new Set(series.flatMap((item) => item.points.map((point) => point.date)))).sort();
    const nextRows = dates.map((date) => {
      const row: Record<string, string | number | null> = { date };
      series.forEach((item, index) => {
        const value = maps[index].get(date);
        row[item.id] = value === undefined ? null : value;
      });
      return row;
    });
    const nextBands: { x1: string; x2: string; party: Term['party'] }[] = [];
    dates.forEach((date) => {
      const term = presidentOn(date, shade, terms);
      if (!term) return;
      const last = nextBands[nextBands.length - 1];
      if (last && last.party === term.party) {
        last.x2 = date;
      } else {
        nextBands.push({ x1: date, x2: date, party: term.party });
      }
    });
    return { rows: nextRows, bands: nextBands };
  }, [series, shade, terms]);

  const tickEvery = Math.max(1, Math.ceil(rows.length / 6));

  return (
    <div className="h-72 sm:h-96 w-full">
      <ResponsiveContainer key={enabled ? 'shade-on' : 'shade-off'} width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={(value) => formatCompact(Number(value))}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-900)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(value) => formatDateLabel(String(value), frequency)}
            formatter={(value, name) => [formatExact(String(value ?? '')), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((item, index) => (
            <Line
              key={item.id}
              type="monotone"
              dataKey={item.id}
              name={lineLabel(item.name, item.units, series)}
              stroke={LINE_COLORS[index % LINE_COLORS.length]}
              dot={false}
              strokeWidth={1.8}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
