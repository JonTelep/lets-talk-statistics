import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SWRProvider } from '@/components/providers/SWRProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Editorial fonts loaded via CSS @import for better control
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://letstalkstatistics.com'),
  title: {
    default: "Let's Talk Statistics — Government Data Without Spin",
    template: "%s — Let's Talk Statistics",
  },
  description: 'Authoritative analysis of U.S. government statistics. Explore federal spending, national debt, employment data, and congressional trades from official sources with editorial rigor.',
  keywords: [
    'government statistics', 
    'federal data', 
    'national debt', 
    'public spending', 
    'congressional trades',
    'economic analysis',
    'political data',
    'treasury data',
    'objective journalism'
  ],
  authors: [{ name: "Let's Talk Statistics", url: 'https://letstalkstatistics.com' }],
  creator: 'Telep IO',
  publisher: 'Telep IO',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Let's Talk Statistics — Government Data Without Spin",
    description: 'Authoritative statistical analysis from official U.S. government sources',
    url: 'https://letstalkstatistics.com',
    siteName: "Let's Talk Statistics",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Let's Talk Statistics — Government Data Without Spin",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Let's Talk Statistics — Government Data Without Spin",
    description: 'Authoritative statistical analysis from official sources',
    creator: '@telep_io',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'theme-color': '#dc2626',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" className={jetbrainsMono.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <SWRProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}