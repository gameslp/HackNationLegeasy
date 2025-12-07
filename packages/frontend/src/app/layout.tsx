import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Link from 'next/link';
import { Scale, Lightbulb, Layers, GitBranch, Settings } from 'lucide-react';
import { CookieConsent } from '@/components/CookieConsent';
import { Footer } from '@/components/Footer';

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
          {/* Skip links for keyboard navigation - WCAG 2.4.1 */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            Przejdź do treści głównej
          </a>
          <a
            href="#main-navigation"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-64 focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
          >
            Przejdź do nawigacji
          </a>

          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col">
            <header role="banner">
              <nav
                id="main-navigation"
                aria-label="Nawigacja główna"
                className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100 sticky top-0 z-50"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                      <Link
                        href="/"
                        className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
                        aria-label="Legeasy - Strona główna"
                      >
                        <div className="relative" aria-hidden="true">
                          <div className="absolute inset-0 bg-primary-400 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                          <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-rotate-3">
                            <Scale className="w-5 h-5 text-white" aria-hidden="true" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 bg-clip-text text-transparent group-hover:from-primary-500 group-hover:to-blue-500 transition-all duration-300">
                            Legeasy
                          </span>
                          <span className="hidden sm:block text-[10px] text-gray-500 font-medium -mt-1 tracking-wide">
                            PROCES LEGISLACYJNY
                          </span>
                        </div>
                      </Link>
                    </div>

                    {/* Navigation */}
                    <ul className="flex items-center gap-1" role="menubar" aria-label="Menu główne">
                      <li role="none">
                        <Link
                          href="/#ustawy"
                          role="menuitem"
                          className="group flex items-center gap-2 text-gray-700 hover:text-primary-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                          <Scale className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                          <span>Ustawy</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/ideas"
                          role="menuitem"
                          className="group flex items-center gap-2 text-gray-700 hover:text-amber-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        >
                          <Lightbulb className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" aria-hidden="true" />
                          <span>Pomysły</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/phases"
                          role="menuitem"
                          className="group flex items-center gap-2 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <Layers className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                          <span>Fazy</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/stages"
                          role="menuitem"
                          className="group flex items-center gap-2 text-gray-700 hover:text-green-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          <GitBranch className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                          <span>Etapy</span>
                        </Link>
                      </li>

                      <li role="none" aria-hidden="true">
                        <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2" />
                      </li>

                      <li role="none">
                        <Link
                          href="/admin"
                          role="menuitem"
                          className="group relative flex items-center gap-2 overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
                          <Settings className="relative w-4 h-4 group-hover:rotate-90 transition-transform duration-500" aria-hidden="true" />
                          <span className="relative">Panel Admin</span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Animated bottom border */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50" aria-hidden="true" />
              </nav>
            </header>

            <main
              id="main-content"
              role="main"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full"
              tabIndex={-1}
            >
              {children}
            </main>

            <Footer />
          </div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
