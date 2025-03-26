import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata, Viewport } from 'next';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Event Planner - Manage Events & Bookings',
  description: 'A comprehensive event management system for organizing events, managing bookings, and sending automated notifications.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 