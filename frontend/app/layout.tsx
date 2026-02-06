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
  metadataBase: new URL('https://letstalkstatistics.com'),
  title: {
    default: "Let's Talk Statistics | Government Data Without Spin",
    template: "%s | Let's Talk Statistics",
  },
  description: 'Objective analysis of US government statistics. Explore federal spending, national debt, employment data, congressional trades, and more from official sources.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  keywords: ['government statistics', 'federal data', 'national debt', 'public spending', 'objective analysis', 'employment data', 'congressional trades'],
  authors: [{ name: "Let's Talk Statistics", url: 'https://letstalkstatistics.com' }],
  creator: 'Telep IO',
  publisher: 'Telep IO',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        url: '/og-default.png',
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
    images: ['/og-default.png'],
  },
  verification: {
    google: 'verification-code-here',
  },
  alternates: {
    canonical: 'https://letstalkstatistics.com',
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
