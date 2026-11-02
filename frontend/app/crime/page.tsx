import type { Metadata } from 'next';
import TodoList from '@/components/status/TodoList';
import { site } from '@/lib/site';

const title = 'Crime';
const description = 'Violent and property crime charts are omitted until an official FBI file can be fetched and checked.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://letstalkstatistics.com/crime' },
  robots: { index: true, follow: true },
};

export default function CrimePage() {
  const items = site.todos.filter((item) => item.id === 'fbi-ucr' || item.id.startsWith('fbi'));
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl">
        No crime rate is shown on this page. The fetch record below is the reason.
      </p>
      <div className="mt-8">
        <TodoList items={items} />
      </div>
    </div>
  );
}
