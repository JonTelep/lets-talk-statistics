import type { Metadata } from 'next';
import { Orbitron, Space_Mono, Exo_2 } from 'next/font/google';
import '../styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SWRProvider } from '@/components/providers/SWRProvider';

// Retro-Futuristic Font System - 70s NASA Space Program Aesthetic
const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['400', '500', '700', '800', '900'],
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '700'],
});

const exo2 = Exo_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://letstalkstatistics.com'),
  title: {
    default: "Mission Control: Government Data | Let's Talk Statistics",
    template: "%s | Mission Control Data",
  },
  description: 'Advanced government data analysis system. Real-time federal statistics from space-age mission control interface. Direct pipeline to official databases.',
  keywords: ['government data', 'mission control', 'federal statistics', 'space-age analytics', 'real-time data', 'congressional trades', 'retro-futuristic'],
  authors: [{ name: "Mission Control Data Systems", url: 'https://letstalkstatistics.com' }],
  creator: 'Telep IO Space Division',
  publisher: 'Telep IO Space Division',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Mission Control: Government Data",
    description: 'Space-age interface for real-time government statistics and federal data analysis',
    url: 'https://letstalkstatistics.com',
    siteName: "Let's Talk Statistics - Mission Control",
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: "Mission Control: Government Data - Retro-Futuristic Interface",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mission Control: Government Data",
    description: 'Space-age interface for real-time government statistics',
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
    <html lang="en" className={`${orbitron.variable} ${spaceMono.variable} ${exo2.variable}`}>
      <head>
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" as="style" />
      </head>
      <body className="font-mono flex min-h-screen flex-col bg-deep-space text-chrome-silver antialiased backdrop-tech">
        <SWRProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SWRProvider>
        
        {/* Space Dust Animation Overlay */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20px 30px, rgba(0, 255, 65, 0.3), transparent),
            radial-gradient(1px 1px at 40px 70px, rgba(255, 69, 0, 0.2), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(147, 112, 219, 0.2), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(0, 255, 65, 0.1), transparent),
            radial-gradient(1px 1px at 160px 30px, rgba(255, 176, 0, 0.2), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'space-drift 20s linear infinite'
        }} />
        
        <style jsx>{`
          @keyframes space-drift {
            0% { transform: translateX(0px) translateY(0px); }
            100% { transform: translateX(-200px) translateY(-100px); }
          }
        `}</style>
      </body>
    </html>
  );
}