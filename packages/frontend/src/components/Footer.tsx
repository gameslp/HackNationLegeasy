'use client';

import Link from 'next/link';
import { Scale, Cookie, FileText, Shield, Accessibility, Gavel } from 'lucide-react';

export function Footer() {
  const openCookieSettings = () => {
    if (typeof window !== 'undefined' && (window as unknown as { openCookieSettings?: () => void }).openCookieSettings) {
      (window as unknown as { openCookieSettings: () => void }).openCookieSettings();
    }
  };

  return (
    <footer
      role="contentinfo"
      aria-label="Stopka strony"
      className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Scale className="w-4 h-4" aria-hidden="true" />
            <span>&copy; {new Date().getFullYear()} Legeasy. Wszystkie prawa zastrzeżone.</span>
          </div>
          <nav aria-label="Nawigacja stopki">
            <ul className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <li>
                <Link
                  href="/polityka-prywatnosci"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                >
                  <Shield className="w-3 h-3" aria-hidden="true" />
                  <span>Polityka Prywatności</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/polityka-cookies"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                >
                  <Cookie className="w-3 h-3" aria-hidden="true" />
                  <span>Polityka Cookies</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/regulamin"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                >
                  <FileText className="w-3 h-3" aria-hidden="true" />
                  <span>Regulamin</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dostepnosc"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                >
                  <Accessibility className="w-3 h-3" aria-hidden="true" />
                  <span>Dostępność</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dsa"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                >
                  <Gavel className="w-3 h-3" aria-hidden="true" />
                  <span>DSA</span>
                </Link>
              </li>
              <li>
                <button
                  onClick={openCookieSettings}
                  type="button"
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  aria-label="Otwórz ustawienia plików cookies"
                >
                  <Cookie className="w-3 h-3" aria-hidden="true" />
                  <span>Ustawienia cookies</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
