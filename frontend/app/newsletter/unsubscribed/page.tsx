import type { Metadata } from 'next';

const title = 'Unsubscribed';
const description = 'The address will not get the stat of the week. No email is sent to confirm this.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
};

export default function UnsubscribedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl text-base">
        If you just used an unsubscribe link, that address will not get the stat of the week. No email is sent to confirm this.
      </p>
    </div>
  );
}
