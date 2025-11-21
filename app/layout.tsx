// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import FloatingParticles from '@/components/FloatingParticles';

export const metadata: Metadata = {
  title: 'DagStats - Dagestan UFC Fighter Tracker & Statistics',
  description: 'Track Dagestani UFC fighters, upcoming fights, and historical statistics. Follow Khabib\'s legacy with real-time fight data, win rates, and comprehensive MMA analytics for Dagestan-born fighters.',
  keywords: [
    'Dagestan UFC',
    'Dagestani fighters',
    'Khabib',
    'Islam Makhachev',
    'UFC Dagestan',
    'Dagestan MMA',
    'UFC stats',
    'MMA statistics',
    'Dagestani wrestlers',
    'UFC fight tracker',
    'Dagestan win rate',
    'Russian UFC fighters',
  ],
  authors: [{ name: 'DagStats' }],
  openGraph: {
    title: 'DagStats - Dagestan UFC Fighter Tracker & Statistics',
    description: 'Track Dagestani UFC fighters, upcoming fights, and historical statistics. Follow Khabib\'s legacy with real-time fight data and MMA analytics.',
    type: 'website',
    url: 'https://dagestani-mma.vercel.app',
    siteName: 'DagStats',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'DagStats - Dagestan UFC Fighter Statistics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DagStats - Dagestan UFC Fighter Tracker',
    description: 'Track Dagestani UFC fighters, upcoming fights, and historical statistics. Follow Khabib\'s legacy with real-time MMA data.',
    images: ['/opengraph-image.png'],
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </head>
      <body className="bg-black text-slate-100 min-h-screen">
        <div id="camera">
          <div id="scene">
            <div id="dagestan-bg" />
            <div id="space-bg" />
          </div>
          
          <FloatingParticles />
          
          <div id="content" className="min-h-screen flex flex-col">
            {children}
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
