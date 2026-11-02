import type { TodoRecord } from '@/lib/site';

export default function TodoList({ items }: { items: TodoRecord[] }) {
  if (items.length === 0) {
    return <p>This page has no omitted dataset in the current build.</p>;
  }
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="card p-4 sm:p-6">
          <h2 className="text-xl">{item.dataset}</h2>
          <p className="mt-3 text-sm">{item.reason}</p>
          {item.url && (
            <p className="mt-3 text-sm">
              <a href={item.url} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                {item.url}
              </a>
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
