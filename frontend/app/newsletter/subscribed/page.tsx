import type { Metadata } from 'next';

const title = 'Signed up';
const description = 'The address is on the stat of the week list. No confirmation email is sent.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
};

export default function SubscribedPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <h1>{title}</h1>
      <p className="mt-4 max-w-3xl text-base">
        If you just used the form, your address is on the stat of the week list. No confirmation email is sent.
      </p>
    </div>
  );
}
