import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Event Planner - Manage Events & Bookings',
  description: 'A comprehensive event management system for organizing events, managing bookings, and sending automated notifications.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
} 