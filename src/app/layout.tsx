import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Китайский язык | 中文',
  description: 'Приложение для изучения китайского языка. Учительница Мадина Мержанкызы',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-md mx-auto px-4 py-6 flex flex-col min-h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
