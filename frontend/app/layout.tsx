import type { Metadata } from 'next';
import { Source_Sans_3, Zilla_Slab, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const zillaSlab = Zilla_Slab({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Let's Talk Statistics | Government Data Without Spin",
  description: 'Objective analysis of US government statistics. Explore federal spending, national debt, employment data, and more from official sources.',
  keywords: ['government statistics', 'federal data', 'national debt', 'public spending', 'objective analysis'],
  authors: [{ name: "Let's Talk Statistics" }],
  openGraph: {
    title: "Let's Talk Statistics",
    description: 'Government data without spin - objective statistical analysis',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${zillaSlab.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans flex min-h-screen flex-col bg-gray-50 text-federal-charcoal-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
