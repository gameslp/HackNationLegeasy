import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Polityka Cookies | Legeasy',
  description: 'Polityka plików cookies serwisu Legeasy - informacje o wykorzystywanych plikach cookies',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Powrót do strony głównej
      </Link>

      <Card>
        <CardContent className="prose prose-gray max-w-none p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Polityka Cookies</h1>

          <p className="text-sm text-gray-500 mb-8">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Czym są pliki cookies?</h2>
            <p>
              Pliki cookies (tzw. &quot;ciasteczka&quot;) to małe pliki tekstowe, które są zapisywane
              na Państwa urządzeniu (komputerze, tablecie, smartfonie) podczas korzystania z serwisu
              internetowego. Cookies pozwalają na rozpoznanie urządzenia użytkownika i odpowiednie
              dostosowanie strony do jego indywidualnych preferencji.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Rodzaje wykorzystywanych cookies</h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.1. Cookies niezbędne (techniczne)</h3>
            <p>
              Są to pliki cookies absolutnie niezbędne do prawidłowego funkcjonowania serwisu.
              Bez nich korzystanie z podstawowych funkcji serwisu byłoby niemożliwe.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Nazwa</th>
                    <th className="text-left py-2">Cel</th>
                    <th className="text-left py-2">Czas życia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">cookie_consent</td>
                    <td className="py-2">Przechowuje wybory dotyczące cookies</td>
                    <td className="py-2">12 miesięcy</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">session_id</td>
                    <td className="py-2">Identyfikator sesji użytkownika</td>
                    <td className="py-2">Sesja</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Podstawa prawna:</strong> Nie wymagają zgody - niezbędne do świadczenia usługi (art. 173 ust. 3 Prawa telekomunikacyjnego)
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">2.2. Cookies funkcjonalne</h3>
            <p>
              Pozwalają zapamiętać preferencje użytkownika i dostosować serwis do jego potrzeb
              (np. preferowany język, wielkość czcionki, układ strony).
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Nazwa</th>
                    <th className="text-left py-2">Cel</th>
                    <th className="text-left py-2">Czas życia</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">user_preferences</td>
                    <td className="py-2">Preferencje wyświetlania</td>
                    <td className="py-2">12 miesięcy</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">chat_history</td>
                    <td className="py-2">Historia rozmów z chatbotem</td>
                    <td className="py-2">30 dni</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Podstawa prawna:</strong> Zgoda użytkownika (art. 6 ust. 1 lit. a RODO)
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">2.3. Cookies analityczne</h3>
            <p>
              Służą do zbierania informacji o sposobie korzystania z serwisu, co pozwala na
              jego ulepszanie i optymalizację. Dane są anonimizowane.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Dostawca</th>
                    <th className="text-left py-2">Cel</th>
                    <th className="text-left py-2">Więcej informacji</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Wewnętrzna analityka</td>
                    <td className="py-2">Statystyki odwiedzin i zachowań</td>
                    <td className="py-2">Dane nie są przekazywane podmiotom trzecim</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Podstawa prawna:</strong> Zgoda użytkownika (art. 6 ust. 1 lit. a RODO)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Zarządzanie zgodami na cookies</h2>
            <p>
              Przy pierwszej wizycie w serwisie wyświetlany jest baner informujący o wykorzystywaniu
              plików cookies. Mogą Państwo:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Zaakceptować wszystkie cookies</strong> - włączone zostaną wszystkie rodzaje cookies</li>
              <li><strong>Zaakceptować tylko niezbędne</strong> - włączone zostaną jedynie cookies techniczne</li>
              <li><strong>Dostosować ustawienia</strong> - samodzielnie wybrać kategorie cookies</li>
            </ul>
            <p className="mt-4">
              W każdej chwili mogą Państwo zmienić swoje preferencje dotyczące cookies klikając
              przycisk &quot;Ustawienia cookies&quot; w stopce strony.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Zarządzanie cookies w przeglądarce</h2>
            <p>
              Niezależnie od ustawień w serwisie, mogą Państwo zarządzać plikami cookies
              bezpośrednio w swojej przeglądarce internetowej:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Google Chrome:</strong>{' '}
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Instrukcja zarządzania cookies
                </a>
              </li>
              <li>
                <strong>Mozilla Firefox:</strong>{' '}
                <a
                  href="https://support.mozilla.org/pl/kb/wzmocniona-ochrona-przed-sledzeniem-firefox-desktop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Instrukcja zarządzania cookies
                </a>
              </li>
              <li>
                <strong>Safari:</strong>{' '}
                <a
                  href="https://support.apple.com/pl-pl/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Instrukcja zarządzania cookies
                </a>
              </li>
              <li>
                <strong>Microsoft Edge:</strong>{' '}
                <a
                  href="https://support.microsoft.com/pl-pl/microsoft-edge/usuwanie-plik%C3%B3w-cookie-w-przegl%C4%85darce-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Instrukcja zarządzania cookies
                </a>
              </li>
            </ul>
            <p className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <strong>Uwaga:</strong> Wyłączenie lub ograniczenie obsługi plików cookies może wpłynąć
              na niektóre funkcjonalności serwisu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prawo do wycofania zgody</h2>
            <p>
              Zgodnie z art. 7 ust. 3 RODO, mają Państwo prawo do wycofania zgody na cookies
              w dowolnym momencie. Wycofanie zgody nie wpływa na zgodność z prawem przetwarzania,
              którego dokonano na podstawie zgody przed jej wycofaniem.
            </p>
            <p className="mt-2">
              Aby wycofać zgodę:
            </p>
            <ol className="list-decimal pl-6 mt-2">
              <li>Kliknij &quot;Ustawienia cookies&quot; w stopce strony</li>
              <li>Odznacz kategorie cookies, na które chcesz wycofać zgodę</li>
              <li>Kliknij &quot;Zapisz ustawienia&quot;</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies podmiotów trzecich</h2>
            <p>
              Serwis może zawierać treści osadzone z zewnętrznych serwisów (np. filmy, mapy).
              Te serwisy mogą umieszczać własne pliki cookies. Nie mamy kontroli nad cookies
              podmiotów trzecich i zachęcamy do zapoznania się z ich politykami prywatności.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Zmiany polityki cookies</h2>
            <p>
              Niniejsza Polityka Cookies może być okresowo aktualizowana. O istotnych zmianach
              będziemy informować poprzez wyświetlenie powiadomienia w serwisie. Zachęcamy do
              regularnego sprawdzania tej strony.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Kontakt</h2>
            <p>
              W razie pytań dotyczących plików cookies prosimy o kontakt:
            </p>
            <ul className="list-none mt-2">
              <li><strong>E-mail:</strong> kontakt@legeasy.pl</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Powiązane dokumenty</h2>
            <ul className="list-disc pl-6">
              <li>
                <Link href="/polityka-prywatnosci" className="text-primary-600 hover:underline">
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="text-primary-600 hover:underline">
                  Regulamin serwisu
                </Link>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
