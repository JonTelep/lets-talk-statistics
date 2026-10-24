import { formatExact } from '@/lib/format';
import { site } from '@/lib/site';

const ROWS: { levelId: string; shareId: string | null }[] = [
  { levelId: 'eia_us_gen_coal', shareId: 'eia_us_share_coal' },
  { levelId: 'eia_us_gen_natural_gas', shareId: 'eia_us_share_natural_gas' },
  { levelId: 'eia_us_gen_nuclear', shareId: 'eia_us_share_nuclear' },
  { levelId: 'eia_us_gen_hydro', shareId: 'eia_us_share_hydro' },
  { levelId: 'eia_us_gen_wind', shareId: 'eia_us_share_wind' },
  { levelId: 'eia_us_gen_solar', shareId: 'eia_us_share_solar' },
  { levelId: 'eia_us_gen_petroleum', shareId: 'eia_us_share_petroleum' },
  { levelId: 'eia_us_gen_other', shareId: 'eia_us_share_other' },
  { levelId: 'eia_us_gen_total', shareId: null },
];

export default function UsGenerationTable() {
  const total = site.series.eia_us_gen_total;
  if (!total || total.points.length === 0) return null;
  const year = total.points.reduce((latest, point) => (point.date > latest ? point.date : latest), total.points[0].date);

  return (
    <div className="overflow-x-auto">
      <h2>United States electricity net generation, {year}</h2>
      <table className="mt-4 w-full min-w-[520px] text-left text-sm">
        <thead className="text-fg-muted">
          <tr>
            <th className="py-2 pr-4 font-medium">Source</th>
            <th className="py-2 pr-4 font-medium">Million kilowatthours</th>
            <th className="py-2 font-medium">Percent</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const level = site.series[row.levelId];
            const share = row.shareId ? site.series[row.shareId] : undefined;
            if (!level) return null;
            const levelPoint = level.points.find((point) => point.date === year);
            const sharePoint = share?.points.find((point) => point.date === year);
            return (
              <tr key={row.levelId} className="border-t border-border">
                <td className="py-3 pr-4">{level.name}</td>
                <td className="py-3 pr-4 font-mono">{levelPoint ? formatExact(levelPoint.value) : ''}</td>
                <td className="py-3 font-mono">{sharePoint ? formatExact(sharePoint.value) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
