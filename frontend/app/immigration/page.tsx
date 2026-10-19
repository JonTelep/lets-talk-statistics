import type { Metadata } from 'next';
import TodoList from '@/components/status/TodoList';
import { site } from '@/lib/site';

const title = 'Immigration';
const description = 'DHS Yearbook and CBP encounter charts are omitted until a workbook can be fetched and parsed without guessing.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/immigration' },
};

export default function ImmigrationPage() {
  const items = site.todos.filter((item) => item.id === 'dhs' || item.id === 'cbp');
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        No immigration count is shown on this page. The fetch records below are the reason. Labels will match the source table when a file is parsed.
      </p>
      <div className="mt-8">
        <TodoList items={items} />
      </div>
    </div>
  );
}
