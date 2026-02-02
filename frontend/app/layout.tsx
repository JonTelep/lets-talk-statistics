import type { Metadata } from 'next';
import { Inter, Playfair_Display, IBM_Plex_Mono } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "Let's Talk Statistics | Editorial Design",
  description: 'Government data with editorial storytelling. Bold, authoritative, trustworthy.',
  keywords: ['government data', 'statistics', 'editorial design', 'journalism', 'data storytelling'],
  authors: [{ name: "Let's Talk Statistics" }],
  openGraph: {
    title: "Let's Talk Statistics | Editorial Design",
    description: 'Government data with editorial storytelling',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable} ${ibmPlexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-white text-editorial-black">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
