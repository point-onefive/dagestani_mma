// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Dagestan UFC Tracker',
  description: 'Tracks upcoming & historical Dagestani UFC fights and win rate.',
  openGraph: {
    title: 'Dagestan UFC Tracker',
    description: 'Tracks upcoming & historical Dagestani UFC fights and win rate.',
    type: 'website',
    url: 'https://dagestani-mma.vercel.app',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Dagestan UFC Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dagestan UFC Tracker',
    description: 'Tracks upcoming & historical Dagestani UFC fights and win rate.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-slate-100 min-h-screen">
        <div className="min-h-screen flex flex-col">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
