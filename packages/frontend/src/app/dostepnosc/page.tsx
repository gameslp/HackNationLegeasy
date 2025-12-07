import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Deklaracja Dostępności | Legeasy',
  description: 'Deklaracja dostępności cyfrowej serwisu Legeasy zgodnie z ustawą o zapewnianiu dostępności osobom ze szczególnymi potrzebami',
};

export default function AccessibilityStatementPage() {
  const currentDate = new Date().toLocaleDateString('pl-PL');
  const reviewDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Powrót do strony głównej
      </Link>

      <Card>
        <CardContent className="prose prose-gray max-w-none p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Deklaracja Dostępności</h1>

          <p className="text-sm text-gray-500 mb-8">
            Ostatnia aktualizacja: {currentDate}
          </p>

          <section className="mb-8" aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Wstęp
            </h2>
            <p>
              Zespół Legeasy zobowiązuje się zapewnić dostępność swojego serwisu internetowego
              zgodnie z przepisami ustawy z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron
              internetowych i aplikacji mobilnych podmiotów publicznych.
            </p>
            <p className="mt-4">
              Niniejsza deklaracja dostępności dotyczy serwisu internetowego{' '}
              <strong>Legeasy</strong> dostępnego pod adresem <strong>legeasy.pl</strong>.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="dates-heading">
            <h2 id="dates-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Data publikacji i aktualizacji
            </h2>
            <ul className="list-none space-y-2">
              <li>
                <strong>Data publikacji strony internetowej:</strong> 2024-01-01
              </li>
              <li>
                <strong>Data ostatniej istotnej aktualizacji:</strong> {currentDate}
              </li>
              <li>
                <strong>Data sporządzenia deklaracji:</strong> {currentDate}
              </li>
              <li>
                <strong>Data przeglądu deklaracji:</strong> {reviewDate}
              </li>
            </ul>
          </section>

          <section className="mb-8" aria-labelledby="status-heading">
            <h2 id="status-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Status zgodności
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-green-800">
                  Strona internetowa jest częściowo zgodna z ustawą z dnia 4 kwietnia 2019 r.
                  o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów
                  publicznych.
                </p>
              </div>
            </div>
            <p className="mt-4">
              Deklarację sporządzono na podstawie samooceny przeprowadzonej przez zespół Legeasy.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="compliant-heading">
            <h2 id="compliant-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Treści zgodne z wymaganiami
            </h2>
            <p>Serwis spełnia następujące wymagania WCAG 2.1 na poziomie AA:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>1.1.1 Treść nietekstowa</strong> – wszystkie obrazy posiadają teksty
                alternatywne lub są oznaczone jako dekoracyjne
              </li>
              <li>
                <strong>1.3.1 Informacje i relacje</strong> – struktura strony jest semantyczna
                (nagłówki, listy, formularze)
              </li>
              <li>
                <strong>1.4.3 Kontrast</strong> – zapewniono minimalny kontrast 4.5:1 dla tekstu
              </li>
              <li>
                <strong>1.4.4 Zmiana rozmiaru tekstu</strong> – strona jest czytelna przy
                powiększeniu do 200%
              </li>
              <li>
                <strong>2.1.1 Klawiatura</strong> – wszystkie funkcje są dostępne z klawiatury
              </li>
              <li>
                <strong>2.1.2 Brak pułapki klawiaturowej</strong> – fokus nie jest blokowany
              </li>
              <li>
                <strong>2.4.1 Pomijanie bloków</strong> – dostępne są linki szybkiego dostępu
                (&quot;skip links&quot;)
              </li>
              <li>
                <strong>2.4.2 Tytuły stron</strong> – każda strona ma unikalny, opisowy tytuł
              </li>
              <li>
                <strong>2.4.3 Kolejność fokusa</strong> – logiczna kolejność nawigacji
              </li>
              <li>
                <strong>2.4.4 Cel linku</strong> – linki mają jasny cel widoczny w kontekście
              </li>
              <li>
                <strong>2.4.7 Widoczny fokus</strong> – fokus klawiatury jest zawsze widoczny
              </li>
              <li>
                <strong>3.1.1 Język strony</strong> – język strony jest określony (pl)
              </li>
              <li>
                <strong>3.2.1 Po otrzymaniu fokusa</strong> – elementy nie zmieniają kontekstu
                przy fokusie
              </li>
              <li>
                <strong>3.3.1 Identyfikacja błędu</strong> – błędy formularzy są jasno opisane
              </li>
              <li>
                <strong>4.1.1 Parsowanie</strong> – kod HTML jest poprawny
              </li>
              <li>
                <strong>4.1.2 Nazwa, rola, wartość</strong> – komponenty mają odpowiednie atrybuty
                ARIA
              </li>
            </ul>
          </section>

          <section className="mb-8" aria-labelledby="noncompliant-heading">
            <h2 id="noncompliant-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Treści niezgodne z wymaganiami
            </h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-amber-800 mb-2">
                  Następujące treści mogą nie być w pełni dostępne:
                </p>
                <ul className="list-disc pl-6 text-amber-700 space-y-1">
                  <li>
                    Niektóre dokumenty PDF mogą nie być w pełni dostępne – pracujemy nad ich
                    konwersją do formatu dostępnego
                  </li>
                  <li>
                    Odpowiedzi chatbota AI mogą nie być w pełni przewidywalne dla technologii
                    wspomagających
                  </li>
                  <li>
                    Mapy i schematy procesów legislacyjnych mogą wymagać alternatywnych opisów
                  </li>
                </ul>
              </div>
            </div>
            <p className="mt-4">
              <strong>Przyczyna niezgodności:</strong> Niektóre treści zostały opublikowane przed
              wejściem w życie ustawy o dostępności cyfrowej lub pochodzą z zewnętrznych źródeł.
            </p>
            <p className="mt-2">
              <strong>Planowane działania:</strong> Systematycznie poprawiamy dostępność serwisu
              i planujemy usunięcie wskazanych barier do końca 2025 roku.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="accessibility-features">
            <h2 id="accessibility-features" className="text-xl font-semibold text-gray-900 mb-4">
              Funkcje ułatwień dostępu
            </h2>
            <p>Serwis oferuje następujące ułatwienia:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>
                <strong>Linki szybkiego dostępu</strong> – naciśnij Tab po wczytaniu strony,
                aby przejść do głównej treści lub nawigacji
              </li>
              <li>
                <strong>Obsługa klawiatury</strong> – pełna nawigacja za pomocą klawiatury
                (Tab, Enter, Escape, strzałki)
              </li>
              <li>
                <strong>Responsywność</strong> – strona dostosowuje się do różnych rozmiarów ekranu
              </li>
              <li>
                <strong>Wyraźny fokus</strong> – widoczne oznaczenie aktualnie wybranego elementu
              </li>
              <li>
                <strong>Semantyczne nagłówki</strong> – prawidłowa hierarchia nagłówków
              </li>
              <li>
                <strong>Opisy alternatywne</strong> – obrazy mają teksty alternatywne
              </li>
              <li>
                <strong>Respektowanie preferencji systemowych</strong> – obsługa trybu wysokiego
                kontrastu i ograniczonego ruchu
              </li>
            </ul>
          </section>

          <section className="mb-8" aria-labelledby="keyboard-heading">
            <h2 id="keyboard-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Skróty klawiaturowe
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Klawisz</th>
                    <th className="text-left py-2">Funkcja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 rounded">Tab</kbd></td>
                    <td className="py-2">Przejście do następnego elementu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-gray-200 rounded">Tab</kbd></td>
                    <td className="py-2">Przejście do poprzedniego elementu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd></td>
                    <td className="py-2">Aktywacja wybranego elementu</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 rounded">Escape</kbd></td>
                    <td className="py-2">Zamknięcie okna dialogowego</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4"><kbd className="px-2 py-1 bg-gray-200 rounded">Space</kbd></td>
                    <td className="py-2">Zaznaczenie/odznaczenie pola wyboru</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="feedback-heading">
            <h2 id="feedback-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Informacje zwrotne i dane kontaktowe
            </h2>
            <p>
              W przypadku problemów z dostępnością strony internetowej prosimy o kontakt:
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <span>
                  <strong>E-mail:</strong>{' '}
                  <a
                    href="mailto:dostepnosc@legeasy.pl"
                    className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                  >
                    dostepnosc@legeasy.pl
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <span>
                  <strong>Telefon:</strong> +48 123 456 789
                </span>
              </div>
            </div>
            <p className="mt-4">
              Tą samą drogą można składać wnioski o udostępnienie informacji niedostępnej
              oraz składać skargi na brak zapewnienia dostępności.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="procedure-heading">
            <h2 id="procedure-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Procedura wnioskowo-skargowa
            </h2>
            <p>
              Każdy ma prawo do wystąpienia z żądaniem zapewnienia dostępności cyfrowej strony
              internetowej lub jakiegoś jej elementu. Można także zażądać udostępnienia informacji
              za pomocą alternatywnego sposobu dostępu.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Żądanie powinno zawierać:
            </h3>
            <ul className="list-disc pl-6">
              <li>Dane kontaktowe osoby zgłaszającej</li>
              <li>Wskazanie strony lub elementu strony, którego dotyczy żądanie</li>
              <li>Wskazanie dogodnej formy udostępnienia informacji, jeśli żądanie dotyczy
                  udostępnienia w formie alternatywnej</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Terminy rozpatrzenia:
            </h3>
            <ul className="list-disc pl-6">
              <li>
                <strong>Realizacja żądania:</strong> niezwłocznie, nie później niż w ciągu 7 dni
                od dnia wystąpienia z żądaniem
              </li>
              <li>
                <strong>Powiadomienie o przyczynach opóźnienia:</strong> jeżeli dotrzymanie
                terminu nie jest możliwe, wraz z wyznaczeniem nowego terminu (nie dłuższego niż
                2 miesiące od dnia wystąpienia z żądaniem)
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Postępowanie odwoławcze:
            </h3>
            <p>
              W przypadku odmowy realizacji żądania lub w przypadku odmowy wniosku o dostęp
              alternatywny, można złożyć skargę do{' '}
              <strong>Rzecznika Praw Obywatelskich</strong>.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="font-medium">Rzecznik Praw Obywatelskich</p>
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span>Al. Solidarności 77, 00-090 Warszawa</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <span>800 676 676 (infolinia)</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-gray-500" aria-hidden="true" />
                <a
                  href="https://www.rpo.gov.pl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  www.rpo.gov.pl
                </a>
              </div>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="physical-heading">
            <h2 id="physical-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Dostępność architektoniczna
            </h2>
            <p>
              Serwis Legeasy jest usługą online i nie posiada siedziby fizycznej dostępnej
              dla użytkowników.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="mobile-heading">
            <h2 id="mobile-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Aplikacje mobilne
            </h2>
            <p>
              Obecnie serwis Legeasy nie posiada dedykowanych aplikacji mobilnych.
              Strona internetowa jest responsywna i dostosowana do urządzeń mobilnych.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Powiązane dokumenty
            </h2>
            <ul className="list-disc pl-6">
              <li>
                <Link href="/polityka-prywatnosci" className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link href="/polityka-cookies" className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
                  Polityka Cookies
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="text-primary-600 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded">
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
