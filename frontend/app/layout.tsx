import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Let's Talk Statistics | Objective Crime Data",
  description: 'Explore US crime statistics from government sources. Understand the data, analyze trends, and draw your own conclusions.',
  keywords: ['crime statistics', 'FBI data', 'per capita', 'government data', 'crime trends'],
  authors: [{ name: "Let's Talk Statistics" }],
  openGraph: {
    title: "Let's Talk Statistics",
    description: 'Objective crime statistics from US government sources',
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
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
