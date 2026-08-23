import type {Metadata, Viewport} from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata: Metadata = {
  title: 'Whereabouts',
  description: 'A mobile-first location-sharing app foundation.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-white flex flex-col h-[100dvh] w-full overflow-hidden antialiased text-zinc-900 select-none">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
