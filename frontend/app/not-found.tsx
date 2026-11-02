import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1>Page not found</h1>
      <p className="mt-4">
        <Link href="/" className="text-accent hover:underline">
          Back to the charts
        </Link>
      </p>
    </div>
  );
}
