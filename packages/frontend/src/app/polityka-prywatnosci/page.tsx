import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Polityka Prywatności | Legeasy',
  description: 'Polityka prywatności serwisu Legeasy - informacje o przetwarzaniu danych osobowych zgodnie z RODO',
};

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Polityka Prywatności</h1>

          <p className="text-sm text-gray-500 mb-8">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Administrator Danych Osobowych</h2>
            <p>
              Administratorem Państwa danych osobowych jest zespół Legeasy (dalej: &quot;Administrator&quot;),
              odpowiedzialny za prowadzenie serwisu internetowego Legeasy dostępnego pod adresem legeasy.pl.
            </p>
            <p>
              Kontakt z Administratorem możliwy jest poprzez adres e-mail: <strong>kontakt@legeasy.pl</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Podstawa prawna przetwarzania danych</h2>
            <p>Przetwarzanie danych osobowych odbywa się zgodnie z:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO)</li>
              <li>Ustawą z dnia 10 maja 2018 r. o ochronie danych osobowych</li>
              <li>Ustawą z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną</li>
              <li>Krajowymi Ramami Interoperacyjności (KRI)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cele i zakres przetwarzania danych</h2>
            <p>Państwa dane osobowe przetwarzamy w następujących celach:</p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">3.1. Świadczenie usług serwisu</h3>
            <ul className="list-disc pl-6">
              <li>Udostępnianie informacji o procesie legislacyjnym</li>
              <li>Umożliwienie przeglądania projektów ustaw i ich etapów</li>
              <li>Obsługa chatbota i asystenta AI</li>
            </ul>
            <p className="mt-2">
              <strong>Podstawa prawna:</strong> art. 6 ust. 1 lit. b) RODO - niezbędność do wykonania umowy o świadczenie usług
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">3.2. Analityka i ulepszanie serwisu</h3>
            <ul className="list-disc pl-6">
              <li>Analiza sposobu korzystania z serwisu</li>
              <li>Optymalizacja wydajności i funkcjonalności</li>
            </ul>
            <p className="mt-2">
              <strong>Podstawa prawna:</strong> art. 6 ust. 1 lit. a) RODO - zgoda użytkownika
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">3.3. Bezpieczeństwo i ochrona przed nadużyciami</h3>
            <ul className="list-disc pl-6">
              <li>Zapobieganie nieautoryzowanemu dostępowi</li>
              <li>Ochrona przed atakami i nadużyciami</li>
            </ul>
            <p className="mt-2">
              <strong>Podstawa prawna:</strong> art. 6 ust. 1 lit. f) RODO - prawnie uzasadniony interes administratora
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Ochrona małoletnich</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-blue-800 mb-2">
                Stosujemy szczególne środki ochrony osób małoletnich:
              </p>
            </div>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Wymaganie potwierdzenia wieku:</strong> Korzystanie z funkcji dyskusji wymaga
                potwierdzenia ukończenia 16 lat lub zgody rodzica/opiekuna prawnego (zgodnie z art. 8 RODO)
              </li>
              <li>
                <strong>Moderacja treści:</strong> System automatycznie wykrywa i blokuje próby
                publikacji danych osobowych (numery telefonów, adresy email, PESEL)
              </li>
              <li>
                <strong>Pseudonimizacja:</strong> Zachęcamy do używania pseudonimów zamiast
                prawdziwych imion i nazwisk
              </li>
              <li>
                <strong>Ostrzeżenia:</strong> Przed publikacją komentarza wyświetlamy przypomnienie
                o nieudostępnianiu danych osobowych
              </li>
              <li>
                <strong>Brak gromadzenia danych wrażliwych:</strong> Nie zbieramy danych dotyczących
                wieku, szkoły, miejsca zamieszkania ani innych danych identyfikujących małoletnich
              </li>
            </ul>
            <p className="mt-4">
              Rodzice i opiekunowie prawni mogą w każdej chwili zażądać usunięcia treści
              opublikowanych przez małoletniego, kontaktując się z nami pod adresem:
              <strong> kontakt@legeasy.pl</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Kategorie przetwarzanych danych</h2>
            <p>W ramach korzystania z serwisu możemy przetwarzać następujące kategorie danych:</p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny, rozdzielczość ekranu</li>
              <li><strong>Dane o aktywności:</strong> odwiedzane strony, czas spędzony w serwisie, kliknięcia</li>
              <li><strong>Dane z formularzy:</strong> treść wiadomości w chatbocie, komentarze do projektów</li>
              <li><strong>Identyfikatory cookies:</strong> zgodnie z <Link href="/polityka-cookies" className="text-primary-600 hover:underline">Polityką Cookies</Link></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Okres przechowywania danych</h2>
            <p>Dane osobowe przechowywane są przez okres:</p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Dane techniczne i analityczne:</strong> maksymalnie 26 miesięcy</li>
              <li><strong>Dane z formularzy kontaktowych:</strong> do czasu zakończenia sprawy + 1 rok</li>
              <li><strong>Cookies sesyjne:</strong> do zamknięcia przeglądarki</li>
              <li><strong>Cookies trwałe:</strong> zgodnie z okresem określonym w Polityce Cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Odbiorcy danych</h2>
            <p>Państwa dane mogą być przekazywane następującym kategoriom odbiorców:</p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Dostawcy usług hostingowych</strong> - w celu przechowywania danych serwisu</li>
              <li><strong>Dostawcy usług analitycznych</strong> - wyłącznie za Państwa zgodą</li>
              <li><strong>Dostawcy usług AI (OpenAI)</strong> - w zakresie obsługi chatbota, dane są anonimizowane</li>
            </ul>
            <p className="mt-2">
              Wszystkie podmioty przetwarzające dane w naszym imieniu działają na podstawie umów powierzenia
              przetwarzania danych osobowych, zgodnie z art. 28 RODO.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Prawa użytkowników</h2>
            <p>Przysługują Państwu następujące prawa:</p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Prawo dostępu</strong> (art. 15 RODO) - uzyskanie informacji o przetwarzanych danych</li>
              <li><strong>Prawo do sprostowania</strong> (art. 16 RODO) - poprawienie nieprawidłowych danych</li>
              <li><strong>Prawo do usunięcia</strong> (art. 17 RODO) - tzw. &quot;prawo do bycia zapomnianym&quot;</li>
              <li><strong>Prawo do ograniczenia przetwarzania</strong> (art. 18 RODO)</li>
              <li><strong>Prawo do przenoszenia danych</strong> (art. 20 RODO)</li>
              <li><strong>Prawo do sprzeciwu</strong> (art. 21 RODO) - wobec przetwarzania opartego na prawnie uzasadnionym interesie</li>
              <li><strong>Prawo do cofnięcia zgody</strong> - w dowolnym momencie, bez wpływu na zgodność z prawem przetwarzania przed cofnięciem</li>
            </ul>
            <p className="mt-4">
              W celu realizacji powyższych praw prosimy o kontakt na adres: <strong>kontakt@legeasy.pl</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Prawo do skargi</h2>
            <p>
              Przysługuje Państwu prawo wniesienia skargi do organu nadzorczego -
              Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa),
              jeżeli uznają Państwo, że przetwarzanie danych osobowych narusza przepisy RODO.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Bezpieczeństwo danych</h2>
            <p>
              Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo
              przetwarzanych danych osobowych, zgodnie z wymogami Krajowych Ram Interoperacyjności (KRI):
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Szyfrowanie transmisji danych (HTTPS/TLS)</li>
              <li>Regularne aktualizacje oprogramowania</li>
              <li>Kontrola dostępu do systemów</li>
              <li>Monitorowanie i wykrywanie incydentów bezpieczeństwa</li>
              <li>Regularne kopie zapasowe</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Pliki cookies</h2>
            <p>
              Serwis wykorzystuje pliki cookies. Szczegółowe informacje o rodzajach cookies,
              celach ich wykorzystania oraz sposobach zarządzania zgodami znajdą Państwo w naszej{' '}
              <Link href="/polityka-cookies" className="text-primary-600 hover:underline">
                Polityce Cookies
              </Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Zmiany polityki prywatności</h2>
            <p>
              Administrator zastrzega sobie prawo do wprowadzania zmian w Polityce Prywatności.
              O wszelkich zmianach użytkownicy będą informowani poprzez publikację zaktualizowanej
              wersji na tej stronie wraz z datą ostatniej modyfikacji.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Kontakt</h2>
            <p>
              W sprawach związanych z ochroną danych osobowych prosimy o kontakt:
            </p>
            <ul className="list-none mt-2">
              <li><strong>E-mail:</strong> kontakt@legeasy.pl</li>
              <li><strong>Temat wiadomości:</strong> &quot;RODO - [temat zapytania]&quot;</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
