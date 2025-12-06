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
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-110">
                        <span className="text-white font-bold text-sm">L</span>
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        Legeasy
                      </span>
                    </Link>
                    <span className="hidden sm:inline-block ml-2 text-sm text-gray-500 font-medium">
                      Proces Legislacyjny
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href="/"
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    >
                      Ustawy
                    </Link>
                    <Link
                      href="/admin"
                      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
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
