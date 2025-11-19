// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dagestan UFC Tracker',
  description: 'Tracks upcoming & historical Dagestani UFC fights and win rate.',
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
      </body>
    </html>
  );
}
