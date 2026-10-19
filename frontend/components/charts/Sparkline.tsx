'use client';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

export default function Sparkline({ points }: { points: { date: string; value: string }[] }) {
  const data = points.map((point) => ({ date: point.date, value: Number(point.value) }));
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
