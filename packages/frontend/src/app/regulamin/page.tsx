import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Regulamin | Legeasy',
  description: 'Regulamin korzystania z serwisu Legeasy - zasady i warunki świadczenia usług drogą elektroniczną',
};

export default function TermsOfServicePage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Regulamin Serwisu</h1>

          <p className="text-sm text-gray-500 mb-8">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 1. Postanowienia ogólne</h2>
            <ol className="list-decimal pl-6">
              <li>
                Niniejszy Regulamin określa zasady korzystania z serwisu internetowego Legeasy
                (dalej: &quot;Serwis&quot;), dostępnego pod adresem legeasy.pl.
              </li>
              <li>
                Właścicielem i operatorem Serwisu jest zespół Legeasy (dalej: &quot;Operator&quot;).
              </li>
              <li>
                Serwis świadczy usługi drogą elektroniczną zgodnie z ustawą z dnia 18 lipca 2002 r.
                o świadczeniu usług drogą elektroniczną (Dz. U. 2002 Nr 144, poz. 1204 ze zm.).
              </li>
              <li>
                Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu oraz zobowiązanie
                do przestrzegania jego postanowień.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 2. Definicje</h2>
            <p>Na potrzeby niniejszego Regulaminu przyjmuje się następujące definicje:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Serwis</strong> – strona internetowa dostępna pod adresem legeasy.pl wraz ze
                wszystkimi podstronami i funkcjonalnościami.
              </li>
              <li>
                <strong>Użytkownik</strong> – każda osoba fizyczna korzystająca z Serwisu.
              </li>
              <li>
                <strong>Usługi</strong> – usługi świadczone drogą elektroniczną przez Operatora za
                pośrednictwem Serwisu.
              </li>
              <li>
                <strong>Chatbot</strong> – asystent AI umożliwiający interakcję z Użytkownikiem
                w zakresie informacji o procesie legislacyjnym.
              </li>
              <li>
                <strong>Treści</strong> – wszelkie materiały, informacje, dane i dokumenty
                udostępniane za pośrednictwem Serwisu.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 3. Rodzaj i zakres usług</h2>
            <ol className="list-decimal pl-6">
              <li>
                Serwis umożliwia:
                <ul className="list-disc pl-6 mt-2">
                  <li>Przeglądanie informacji o procesie legislacyjnym w Polsce</li>
                  <li>Śledzenie postępu prac nad projektami ustaw</li>
                  <li>Dostęp do dokumentów legislacyjnych</li>
                  <li>Korzystanie z chatbota AI do uzyskania informacji</li>
                  <li>Zgłaszanie pomysłów legislacyjnych</li>
                </ul>
              </li>
              <li>
                Usługi świadczone są nieodpłatnie.
              </li>
              <li>
                Korzystanie z niektórych funkcjonalności może wymagać podania danych osobowych
                lub akceptacji plików cookies.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 4. Warunki techniczne</h2>
            <ol className="list-decimal pl-6">
              <li>
                Do korzystania z Serwisu wymagane jest:
                <ul className="list-disc pl-6 mt-2">
                  <li>Urządzenie z dostępem do sieci Internet</li>
                  <li>Aktualna przeglądarka internetowa (Chrome, Firefox, Safari, Edge)</li>
                  <li>Włączona obsługa JavaScript</li>
                  <li>Włączona obsługa cookies (dla pełnej funkcjonalności)</li>
                </ul>
              </li>
              <li>
                Operator nie ponosi odpowiedzialności za problemy techniczne wynikające z
                niespełnienia powyższych wymagań.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 5. Zasady korzystania z Serwisu</h2>
            <ol className="list-decimal pl-6">
              <li>
                Użytkownik zobowiązuje się do:
                <ul className="list-disc pl-6 mt-2">
                  <li>Korzystania z Serwisu zgodnie z jego przeznaczeniem</li>
                  <li>Niepodejmowania działań mogących zakłócić funkcjonowanie Serwisu</li>
                  <li>Nienaruszania praw osób trzecich</li>
                  <li>Przestrzegania przepisów prawa powszechnie obowiązującego</li>
                </ul>
              </li>
              <li>
                Zabrania się:
                <ul className="list-disc pl-6 mt-2">
                  <li>Automatycznego pobierania danych (scraping) bez zgody Operatora</li>
                  <li>Prób uzyskania nieautoryzowanego dostępu do systemów</li>
                  <li>Rozpowszechniania treści niezgodnych z prawem</li>
                  <li>Podszywania się pod inne osoby lub instytucje</li>
                </ul>
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 6. Korzystanie z chatbota AI</h2>
            <ol className="list-decimal pl-6">
              <li>
                Chatbot AI służy jako narzędzie pomocnicze do uzyskiwania informacji o procesie
                legislacyjnym.
              </li>
              <li>
                Odpowiedzi generowane przez chatbota mają charakter informacyjny i nie stanowią
                porady prawnej.
              </li>
              <li>
                Operator nie gwarantuje kompletności ani aktualności odpowiedzi generowanych
                przez AI.
              </li>
              <li>
                Użytkownik powinien weryfikować istotne informacje w oficjalnych źródłach
                (np. Sejm RP, RCL).
              </li>
              <li>
                Treści rozmów z chatbotem mogą być przetwarzane w celu ulepszenia usługi,
                zgodnie z{' '}
                <Link href="/polityka-prywatnosci" className="text-primary-600 hover:underline">
                  Polityką Prywatności
                </Link>.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 7. Prawa własności intelektualnej</h2>
            <ol className="list-decimal pl-6">
              <li>
                Serwis oraz jego elementy (grafiki, logo, układ, kod źródłowy) stanowią
                własność Operatora i są chronione prawem autorskim.
              </li>
              <li>
                Treści dotyczące procesu legislacyjnego pochodzą z publicznych źródeł
                i podlegają przepisom o dostępie do informacji publicznej.
              </li>
              <li>
                Użytkownik ma prawo do korzystania z Serwisu wyłącznie w zakresie
                dozwolonego użytku osobistego.
              </li>
              <li>
                Kopiowanie, rozpowszechnianie lub modyfikowanie elementów Serwisu bez
                zgody Operatora jest zabronione.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 8. Odpowiedzialność</h2>
            <ol className="list-decimal pl-6">
              <li>
                Operator dokłada starań, aby informacje w Serwisie były aktualne i poprawne,
                jednak nie gwarantuje ich kompletności ani bezbłędności.
              </li>
              <li>
                Operator nie ponosi odpowiedzialności za:
                <ul className="list-disc pl-6 mt-2">
                  <li>Decyzje podjęte na podstawie informacji z Serwisu</li>
                  <li>Przerwy w działaniu Serwisu wynikające z przyczyn technicznych</li>
                  <li>Działania siły wyższej</li>
                  <li>Szkody wynikające z nieautoryzowanego dostępu osób trzecich</li>
                </ul>
              </li>
              <li>
                Serwis ma charakter informacyjny i nie zastępuje oficjalnych źródeł
                informacji o procesie legislacyjnym.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 9. Ochrona danych osobowych</h2>
            <ol className="list-decimal pl-6">
              <li>
                Zasady przetwarzania danych osobowych określa{' '}
                <Link href="/polityka-prywatnosci" className="text-primary-600 hover:underline">
                  Polityka Prywatności
                </Link>.
              </li>
              <li>
                Informacje o wykorzystywanych plikach cookies zawiera{' '}
                <Link href="/polityka-cookies" className="text-primary-600 hover:underline">
                  Polityka Cookies
                </Link>.
              </li>
              <li>
                Dane osobowe przetwarzane są zgodnie z RODO oraz polskimi przepisami
                o ochronie danych osobowych.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 10. Reklamacje</h2>
            <ol className="list-decimal pl-6">
              <li>
                Użytkownik ma prawo zgłaszać reklamacje dotyczące funkcjonowania Serwisu.
              </li>
              <li>
                Reklamacje należy zgłaszać na adres e-mail: <strong>kontakt@legeasy.pl</strong>
              </li>
              <li>
                Reklamacja powinna zawierać:
                <ul className="list-disc pl-6 mt-2">
                  <li>Opis problemu</li>
                  <li>Datę wystąpienia</li>
                  <li>Dane kontaktowe zgłaszającego</li>
                </ul>
              </li>
              <li>
                Operator rozpatruje reklamacje w terminie 14 dni roboczych od daty ich otrzymania.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 11. Zmiany Regulaminu</h2>
            <ol className="list-decimal pl-6">
              <li>
                Operator zastrzega sobie prawo do zmiany niniejszego Regulaminu.
              </li>
              <li>
                O zmianach Użytkownicy będą informowani poprzez publikację nowej wersji
                Regulaminu na stronie Serwisu.
              </li>
              <li>
                Korzystanie z Serwisu po wprowadzeniu zmian oznacza akceptację nowej
                wersji Regulaminu.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 12. Postanowienia końcowe</h2>
            <ol className="list-decimal pl-6">
              <li>
                W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają
                przepisy prawa polskiego.
              </li>
              <li>
                Wszelkie spory wynikające z korzystania z Serwisu będą rozstrzygane
                przez sądy właściwe dla siedziby Operatora.
              </li>
              <li>
                Jeżeli którekolwiek z postanowień Regulaminu zostanie uznane za nieważne,
                pozostałe postanowienia zachowują moc.
              </li>
              <li>
                Regulamin wchodzi w życie z dniem publikacji na stronie Serwisu.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 13. Kontakt</h2>
            <p>
              W sprawach związanych z niniejszym Regulaminem prosimy o kontakt:
            </p>
            <ul className="list-none mt-2">
              <li><strong>E-mail:</strong> kontakt@legeasy.pl</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">§ 14. Powiązane dokumenty</h2>
            <ul className="list-disc pl-6">
              <li>
                <Link href="/polityka-prywatnosci" className="text-primary-600 hover:underline">
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                <Link href="/polityka-cookies" className="text-primary-600 hover:underline">
                  Polityka Cookies
                </Link>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
