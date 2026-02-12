import type { Metadata } from 'next';
import { Inter, Crimson_Text, Source_Serif_4 } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SWRProvider } from '@/components/providers/SWRProvider';

// Fraunces is loaded via CSS @import in globals.css for editorial maximalism aesthetic
const crimsonText = Crimson_Text({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '600'],
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif-alt',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://letstalkstatistics.com'),
  title: {
    default: "Let's Talk Statistics | Government Data Without Spin",
    template: "%s | Let's Talk Statistics",
  },
  description: 'Objective analysis of US government statistics. Explore federal spending, national debt, employment data, and more from official sources.',
  keywords: ['government statistics', 'federal data', 'national debt', 'public spending', 'objective analysis', 'congressional trades'],
  authors: [{ name: "Let's Talk Statistics", url: 'https://letstalkstatistics.com' }],
  creator: 'Telep IO',
  publisher: 'Telep IO',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Let's Talk Statistics",
    description: 'Government data without spin - objective statistical analysis from official sources',
    url: 'https://letstalkstatistics.com',
    siteName: "Let's Talk Statistics",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Let's Talk Statistics - Government Data Without Spin",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Let's Talk Statistics",
    description: 'Government data without spin - objective statistical analysis',
    creator: '@telep_io',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimsonText.variable} ${sourceSerif.variable}`}>
      <body className="font-sans flex min-h-screen flex-col bg-newsprint text-editorial-gray antialiased">
        <SWRProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SWRProvider>
      </body>
    </html>
  );
}
