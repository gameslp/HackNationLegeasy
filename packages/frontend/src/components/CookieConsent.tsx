'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { X, Settings, Cookie } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_PREFERENCES_KEY = 'cookie_preferences';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
  });

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash
      const timer = setTimeout(() => setShowBanner(true), 500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  // Focus management - focus first button when dialog opens
  useEffect(() => {
    if (showBanner && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [showBanner]);

  // Trap focus within the dialog
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!showBanner || e.key !== 'Tab') return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, [showBanner]);

  // Handle Escape key
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && showBanner) {
      setShowBanner(false);
    }
  }, [showBanner]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleKeyDown, handleEscape]);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: prefs }));
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  // Function to open settings (can be called from footer)
  const openSettings = () => {
    setShowBanner(true);
    setShowSettings(true);
  };

  // Expose openSettings globally for footer button
  useEffect(() => {
    (window as unknown as { openCookieSettings: () => void }).openCookieSettings = openSettings;
    return () => {
      delete (window as unknown as { openCookieSettings?: () => void }).openCookieSettings;
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/30"
      role="presentation"
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-dialog-title"
        aria-describedby="cookie-dialog-description"
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary-600" aria-hidden="true" />
              <h2 id="cookie-dialog-title" className="text-lg font-semibold text-gray-900">
                Ustawienia plików cookies
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={() => setShowBanner(false)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-1"
              aria-label="Zamknij okno dialogowe"
              type="button"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div id="cookie-dialog-description">
            <p className="text-sm text-gray-700 mb-4">
              Używamy plików cookies, aby zapewnić prawidłowe działanie serwisu oraz, za Twoją zgodą,
              do celów funkcjonalnych i analitycznych. Możesz zmienić swoje preferencje w dowolnym momencie.
            </p>

            <p className="text-sm text-gray-700 mb-4">
              Więcej informacji znajdziesz w naszej{' '}
              <Link
                href="/polityka-cookies"
                className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                Polityce Cookies
              </Link>{' '}
              oraz{' '}
              <Link
                href="/polityka-prywatnosci"
                className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                Polityce Prywatności
              </Link>.
            </p>
          </div>

          {showSettings ? (
            <fieldset className="space-y-4 mb-6">
              <legend className="sr-only">Ustawienia kategorii plików cookies</legend>

              {/* Necessary cookies - always on */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div id="cookie-necessary-desc">
                  <p className="font-medium text-gray-900">Niezbędne</p>
                  <p className="text-xs text-gray-600">
                    Wymagane do prawidłowego działania serwisu
                  </p>
                </div>
                <div className="relative" aria-describedby="cookie-necessary-desc">
                  <input
                    type="checkbox"
                    id="cookie-necessary"
                    checked={true}
                    disabled
                    className="sr-only peer"
                    aria-label="Cookies niezbędne - zawsze włączone"
                  />
                  <div className="w-11 h-6 bg-primary-600 rounded-full opacity-50 cursor-not-allowed" aria-hidden="true"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5" aria-hidden="true"></div>
                </div>
              </div>

              {/* Functional cookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div id="cookie-functional-desc">
                  <p className="font-medium text-gray-900">Funkcjonalne</p>
                  <p className="text-xs text-gray-600">
                    Zapamiętują preferencje i ustawienia
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="cookie-functional"
                    checked={preferences.functional}
                    onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                    className="sr-only peer"
                    aria-describedby="cookie-functional-desc"
                    aria-label="Cookies funkcjonalne"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" aria-hidden="true"></div>
                </label>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div id="cookie-analytics-desc">
                  <p className="font-medium text-gray-900">Analityczne</p>
                  <p className="text-xs text-gray-600">
                    Pomagają ulepszać serwis poprzez anonimowe statystyki
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="cookie-analytics"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                    aria-describedby="cookie-analytics-desc"
                    aria-label="Cookies analityczne"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-5 peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" aria-hidden="true"></div>
                </label>
              </div>
            </fieldset>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="Opcje zgody na cookies">
            {showSettings ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowSettings(false)}
                  className="flex-1"
                  type="button"
                >
                  Wróć
                </Button>
                <Button
                  onClick={saveCustomPreferences}
                  className="flex-1"
                  type="button"
                >
                  Zapisz ustawienia
                </Button>
              </>
            ) : (
              <>
                <Button
                  ref={firstFocusableRef}
                  variant="secondary"
                  onClick={acceptNecessary}
                  className="flex-1"
                  type="button"
                >
                  Tylko niezbędne
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowSettings(true)}
                  className="flex-1"
                  type="button"
                >
                  <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                  Dostosuj
                </Button>
                <Button
                  onClick={acceptAll}
                  className="flex-1"
                  type="button"
                >
                  Akceptuj wszystkie
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check cookie consent status
export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }

    const handleChange = (e: CustomEvent<CookiePreferences>) => {
      setPreferences(e.detail);
    };

    window.addEventListener('cookieConsentChanged', handleChange as EventListener);
    return () => {
      window.removeEventListener('cookieConsentChanged', handleChange as EventListener);
    };
  }, []);

  return preferences;
}
