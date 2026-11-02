import type { Metadata } from 'next';
import { formatRetrieved } from '@/lib/format';
import { seriesFor, site, sourcesFor } from '@/lib/site';

const title = 'Sources and methodology';
const description = 'Publishers, retrieval dates, file hashes, and the datasets this build did not chart.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/sources' },
  openGraph: {
    title,
    description,
    url: 'https://letstalkstatistics.com/sources',
  },
};

export default function SourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1>{title}</h1>
      <div className="mt-4 max-w-3xl space-y-4 text-sm sm:text-base">
        <p>
          scripts/fetch downloads official files, saves them under data/raw, and writes frontend/data/site.json.
          data/manifest.json records the URL, retrieval time, and SHA-256 for each file.
          This build was generated at {site.generated_at}.
        </p>
        <p>
          A chart is included only when every series on it has points. Derived series keep the formula in the series note.
          tests/test_data_integrity.py reads the saved files and fails if a chart value does not match a source row or that formula.
        </p>
        <p>{site.presidents.note}</p>
        <p>
          President dates: {site.presidents.source_name}.{' '}
          <a className="text-accent hover:underline" href={site.presidents.source_url}>
            {site.presidents.source_url.replace(/^https?:\/\//, '')}
          </a>
        </p>
      </div>

      <h2 className="mt-12">Charts</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-fg-muted">
            <tr>
              <th className="py-2 pr-4 font-medium">Chart</th>
              <th className="py-2 pr-4 font-medium">Series</th>
              <th className="py-2 pr-4 font-medium">Publisher</th>
              <th className="py-2 font-medium">Retrieved</th>
            </tr>
          </thead>
          <tbody>
            {site.charts.map((chart) =>
              seriesFor(chart).flatMap((series) => {
                const sources = sourcesFor(series);
                const rows = sources.length > 0 ? sources : [undefined];
                return rows.map((source) => (
                  <tr key={`${chart.id}-${series.id}-${source?.id ?? 'none'}`} className="border-t border-border align-top">
                    <td className="py-3 pr-4">
                      <a className="text-accent hover:underline" href={`/c/${chart.id}`}>
                        {chart.title}
                      </a>
                    </td>
                    <td className="py-3 pr-4">
                      <a className="hover:underline" href={series.series_url}>
                        {series.name}
                      </a>
                    </td>
                    <td className="py-3 pr-4">{source?.publisher}</td>
                    <td className="py-3">{source ? formatRetrieved(source.retrieved_at) : ''}</td>
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12">Files</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-fg-muted">
            <tr>
              <th className="py-2 pr-4 font-medium">Publisher</th>
              <th className="py-2 pr-4 font-medium">File</th>
              <th className="py-2 pr-4 font-medium">Retrieved</th>
              <th className="py-2 font-medium">SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {site.sources.map((source) => (
              <tr key={source.id} className="border-t border-border align-top">
                <td className="py-3 pr-4">{source.publisher}</td>
                <td className="py-3 pr-4">
                  <a className="text-accent hover:underline" href={source.url}>
                    {source.title}
                  </a>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">{formatRetrieved(source.retrieved_at)}</td>
                <td className="py-3 font-mono text-xs break-all">{source.sha256}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12">Omitted datasets</h2>
      <div className="mt-4 space-y-4">
        {site.todos.map((item) => (
          <article key={item.id} className="card p-4 sm:p-6">
            <h3>{item.dataset}</h3>
            <p className="mt-2 text-sm">{item.reason}</p>
            {item.url && (
              <p className="mt-2 text-sm">
                <a className="text-accent hover:underline" href={item.url}>
                  {item.url}
                </a>
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
