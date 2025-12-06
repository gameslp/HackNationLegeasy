import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legeasy - Proces Legislacyjny',
  description: 'System do śledzenia procesu legislacyjnego w Polsce',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen">
            <nav className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold text-primary-600">
                      Legeasy
                    </Link>
                    <span className="ml-2 text-sm text-gray-500">
                      Proces Legislacyjny
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Ustawy
                    </Link>
                    <Link
                      href="/admin"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Panel Admin
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
