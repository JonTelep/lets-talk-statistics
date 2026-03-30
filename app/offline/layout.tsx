import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Offline - Let's Talk Statistics",
  description: "You're currently offline. Check your connection to access the latest government data.",
  robots: 'noindex, nofollow',
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
