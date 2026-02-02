import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "Let's Talk Statistics | Dark Terminal",
  description: 'Government data with terminal aesthetics. Raw numbers, matrix vibes.',
  keywords: ['government data', 'statistics', 'terminal', 'dark theme', 'data visualization'],
  authors: [{ name: "Let's Talk Statistics" }],
  openGraph: {
    title: "Let's Talk Statistics | Dark Terminal",
    description: 'Government data with terminal aesthetics',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-terminal-bg text-terminal-text">
        <Header />
        <main className="flex-1 bg-terminal-grid">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
