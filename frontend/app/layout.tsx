import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Let's Talk Statistics | Clean Design",
  description: 'Beautiful government data visualization. Clean, minimal, trustworthy.',
  keywords: ['government data', 'statistics', 'clean design', 'data visualization', 'minimal'],
  authors: [{ name: "Let's Talk Statistics" }],
  openGraph: {
    title: "Let's Talk Statistics | Clean Design",
    description: 'Beautiful government data visualization',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-minimal-white text-minimal-gray-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
