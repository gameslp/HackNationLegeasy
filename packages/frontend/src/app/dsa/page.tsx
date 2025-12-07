import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Building2, FileText, AlertTriangle, Scale, Clock, Shield } from 'lucide-react';

export const metadata = {
  title: 'Akt o Usługach Cyfrowych (DSA) | Legeasy',
  description: 'Informacje dotyczące zgodności serwisu Legeasy z Aktem o Usługach Cyfrowych (Digital Services Act)',
};

export default function DSAPage() {
  const currentDate = new Date().toLocaleDateString('pl-PL');

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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Akt o Usługach Cyfrowych (DSA)
          </h1>

          <p className="text-sm text-gray-500 mb-8">
            Ostatnia aktualizacja: {currentDate}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-blue-800">
                  Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2022/2065
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Serwis Legeasy działa zgodnie z wymogami Aktu o Usługach Cyfrowych
                  (Digital Services Act), który obowiązuje od 17 lutego 2024 r.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-8" aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl font-semibold text-gray-900 mb-4">
              1. O serwisie Legeasy
            </h2>
            <p>
              Legeasy jest serwisem internetowym umożliwiającym śledzenie procesu legislacyjnego
              w Polsce. Serwis oferuje funkcję dyskusji, w ramach której użytkownicy mogą
              publikować komentarze do poszczególnych etapów procesu legislacyjnego.
            </p>
            <p className="mt-4">
              W rozumieniu DSA, Legeasy jest <strong>dostawcą usług hostingu</strong>, ponieważ
              przechowuje i udostępnia publicznie informacje przekazane przez użytkowników
              (komentarze w dyskusjach).
            </p>
          </section>

          <section className="mb-8" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="text-xl font-semibold text-gray-900 mb-4">
              2. Punkty kontaktowe (art. 11-12 DSA)
            </h2>
            <p>
              Zgodnie z wymogami DSA, wyznaczamy następujące punkty kontaktowe:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Contact for users */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900">Dla użytkowników</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Punkt kontaktowy do komunikacji z użytkownikami serwisu:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <a href="mailto:kontakt@legeasy.pl" className="text-primary-600 hover:underline">
                      kontakt@legeasy.pl
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <span>+48 123 456 789</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Języki komunikacji: polski, angielski
                </p>
              </div>

              {/* Contact for authorities */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  <h3 className="font-semibold text-gray-900">Dla organów</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Punkt kontaktowy dla organów państw członkowskich, Komisji Europejskiej i Rady Usług Cyfrowych:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" aria-hidden="true" />
                    <a href="mailto:dsa@legeasy.pl" className="text-primary-600 hover:underline">
                      dsa@legeasy.pl
                    </a>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Języki komunikacji: polski, angielski
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="reporting-heading">
            <h2 id="reporting-heading" className="text-xl font-semibold text-gray-900 mb-4">
              3. Zgłaszanie nielegalnych treści (art. 16 DSA)
            </h2>
            <p>
              Każda osoba lub podmiot może zgłosić nam obecność w serwisie informacji,
              które uważa za nielegalne treści.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-amber-800">Jak zgłosić nielegalną treść?</p>
                  <ol className="list-decimal pl-4 mt-2 text-sm text-amber-700 space-y-1">
                    <li>
                      Kliknij przycisk &quot;Zgłoś&quot; przy komentarzu lub skorzystaj z{' '}
                      <Link href="/zgloszenie" className="text-primary-600 hover:underline font-medium">
                        formularza zgłoszenia
                      </Link>
                    </li>
                    <li>Podaj dokładną lokalizację treści (link do strony)</li>
                    <li>Wyjaśnij, dlaczego uważasz treść za nielegalną</li>
                    <li>Podaj dane kontaktowe (opcjonalnie, ale zalecane)</li>
                  </ol>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Wymagane elementy zgłoszenia:
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Wyjaśnienie powodów, dla których treść jest uznawana za nielegalną</li>
              <li>Wskazanie dokładnej lokalizacji elektronicznej treści (URL)</li>
              <li>Imię i nazwisko lub nazwa zgłaszającego oraz adres e-mail (chyba że zgłoszenie dotyczy treści związanych z wykorzystywaniem seksualnym dzieci)</li>
              <li>Oświadczenie potwierdzające dobrą wiarę zgłaszającego</li>
            </ul>

            <div className="mt-6">
              <Link
                href="/zgloszenie"
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                Zgłoś nielegalną treść
              </Link>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="moderation-heading">
            <h2 id="moderation-heading" className="text-xl font-semibold text-gray-900 mb-4">
              4. Moderacja treści (art. 17 DSA)
            </h2>
            <p>
              Po otrzymaniu zgłoszenia podejmujemy decyzję w sposób terminowy, staranny,
              niedownolny i obiektywny.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Możliwe działania moderacyjne:
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usunięcie treści</li>
              <li>Ograniczenie widoczności treści</li>
              <li>Uniemożliwienie dostępu do treści</li>
              <li>Zawieszenie lub zakończenie świadczenia usługi</li>
              <li>Zawieszenie lub zamknięcie konta użytkownika</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Uzasadnienie decyzji:
            </h3>
            <p>
              W przypadku podjęcia działań moderacyjnych, użytkownik otrzymuje jasne
              i szczegółowe uzasadnienie zawierające:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Informację o podjętej decyzji i jej zakresie</li>
              <li>Fakty i okoliczności, na których oparto decyzję</li>
              <li>Informacje o wykorzystaniu zautomatyzowanych narzędzi (jeśli dotyczy)</li>
              <li>Pouczenie o możliwości odwołania się</li>
            </ul>
          </section>

          <section className="mb-8" aria-labelledby="appeal-heading">
            <h2 id="appeal-heading" className="text-xl font-semibold text-gray-900 mb-4">
              5. Wewnętrzny system rozpatrywania skarg (art. 20 DSA)
            </h2>
            <p>
              Użytkownicy mają prawo odwołać się od decyzji moderacyjnych przez okres
              <strong> 6 miesięcy</strong> od daty decyzji.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-gray-900">Procedura odwoławcza:</p>
                  <ol className="list-decimal pl-4 mt-2 text-sm text-gray-700 space-y-1">
                    <li>Złóż odwołanie na adres: <strong>odwolania@legeasy.pl</strong></li>
                    <li>Podaj numer decyzji i uzasadnienie odwołania</li>
                    <li>Rozpatrzymy odwołanie w terminie 14 dni</li>
                    <li>Otrzymasz pisemną odpowiedź z uzasadnieniem</li>
                  </ol>
                </div>
              </div>
            </div>

            <p className="mt-4">
              Odwołania rozpatrywane są przez personel, który nie brał udziału w pierwotnej
              decyzji. Decyzje nie są podejmowane wyłącznie na podstawie zautomatyzowanych środków.
            </p>
          </section>

          <section className="mb-8" aria-labelledby="outofcourt-heading">
            <h2 id="outofcourt-heading" className="text-xl font-semibold text-gray-900 mb-4">
              6. Pozasądowe rozstrzyganie sporów (art. 21 DSA)
            </h2>
            <p>
              Jeśli nie jesteś zadowolony z wyniku wewnętrznej procedury odwoławczej,
              masz prawo zwrócić się do certyfikowanego organu pozasądowego rozstrzygania sporów.
            </p>
            <p className="mt-4">
              Lista certyfikowanych organów jest dostępna na stronie Koordynatora ds. Usług
              Cyfrowych. W Polsce funkcję tę pełni Prezes Urzędu Komunikacji Elektronicznej (UKE).
            </p>
            <div className="mt-4">
              <a
                href="https://uke.gov.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                Więcej informacji: uke.gov.pl
              </a>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="transparency-heading">
            <h2 id="transparency-heading" className="text-xl font-semibold text-gray-900 mb-4">
              7. Sprawozdanie z przejrzystości (art. 15 DSA)
            </h2>
            <p>
              Publikujemy roczne sprawozdania dotyczące moderowania treści, zawierające
              informacje o:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Liczbie otrzymanych zgłoszeń i nakazy od organów</li>
              <li>Podjętych działaniach moderacyjnych</li>
              <li>Liczbie odwołań i ich wynikach</li>
              <li>Wykorzystaniu zautomatyzowanych narzędzi</li>
              <li>Średnim czasie rozpatrywania zgłoszeń</li>
            </ul>
            <div className="mt-4">
              <Link
                href="/dsa/raport-przejrzystosci"
                className="inline-flex items-center gap-2 text-primary-600 hover:underline"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                Zobacz raport przejrzystości
              </Link>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="protection-heading">
            <h2 id="protection-heading" className="text-xl font-semibold text-gray-900 mb-4">
              8. Ochrona użytkowników (art. 14, 25 DSA)
            </h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">
              Zakaz dark patterns:
            </h3>
            <p>
              Interfejs serwisu nie zawiera elementów, które mogłyby wprowadzać użytkowników
              w błąd lub manipulować ich decyzjami. Nie stosujemy:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Ukrytych opcji rezygnacji</li>
              <li>Wielokrotnych potwierdzeń przy odmowie</li>
              <li>Wizualnego wyróżniania opcji korzystnych dla nas</li>
              <li>Fałszywej pilności lub ograniczonej dostępności</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-2">
              Warunki korzystania z usługi:
            </h3>
            <p>
              Nasze regulaminy są napisane jasnym i zrozumiałym językiem. Informujemy o:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                Zasadach moderacji treści –{' '}
                <Link href="/regulamin" className="text-primary-600 hover:underline">
                  Regulamin
                </Link>
              </li>
              <li>
                Przetwarzaniu danych osobowych –{' '}
                <Link href="/polityka-prywatnosci" className="text-primary-600 hover:underline">
                  Polityka Prywatności
                </Link>
              </li>
              <li>
                Procedurze zgłaszania i odwoławczej – niniejsza strona
              </li>
            </ul>
          </section>

          <section className="mb-8" aria-labelledby="minors-heading">
            <h2 id="minors-heading" className="text-xl font-semibold text-gray-900 mb-4">
              9. Ochrona małoletnich (art. 28 DSA)
            </h2>
            <p>
              Stosujemy odpowiednie środki zapewniające wysoki poziom prywatności, bezpieczeństwa
              i ochrony małoletnich:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Weryfikacja wieku przy rejestracji do dyskusji (16+ lat lub zgoda rodzica)</li>
              <li>Automatyczne filtrowanie danych osobowych w komentarzach</li>
              <li>Zachęcanie do używania pseudonimów</li>
              <li>Brak targetowania reklam do małoletnich</li>
            </ul>
            <p className="mt-4">
              Więcej informacji:{' '}
              <Link href="/polityka-prywatnosci#ochrona-maloletnich" className="text-primary-600 hover:underline">
                Polityka Prywatności - Ochrona małoletnich
              </Link>
            </p>
          </section>

          <section className="mb-8" aria-labelledby="coordinator-heading">
            <h2 id="coordinator-heading" className="text-xl font-semibold text-gray-900 mb-4">
              10. Koordynator ds. Usług Cyfrowych
            </h2>
            <p>
              W Polsce funkcję Koordynatora ds. Usług Cyfrowych pełni:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
              <p className="font-semibold">Prezes Urzędu Komunikacji Elektronicznej (UKE)</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>ul. Giełdowa 7/9, 01-211 Warszawa</li>
                <li>
                  <a href="https://uke.gov.pl" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    uke.gov.pl
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8" aria-labelledby="legal-heading">
            <h2 id="legal-heading" className="text-xl font-semibold text-gray-900 mb-4">
              11. Podstawa prawna
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <a
                  href="https://eur-lex.europa.eu/legal-content/PL/TXT/?uri=CELEX%3A32022R2065"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Rozporządzenie (UE) 2022/2065 - Akt o Usługach Cyfrowych
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.pl/web/cyfryzacja/akt-o-uslugach-cyfrowych-digital-services-act"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Ministerstwo Cyfryzacji - informacje o DSA
                </a>
              </li>
              <li>
                <a
                  href="https://uke.gov.pl/uslugi-cyfrowe/czym-jest-dsa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  UKE - Czym jest DSA?
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-8" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-gray-900 mb-4">
              12. Powiązane dokumenty
            </h2>
            <ul className="list-disc pl-6">
              <li>
                <Link href="/regulamin" className="text-primary-600 hover:underline">
                  Regulamin serwisu
                </Link>
              </li>
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
              <li>
                <Link href="/dostepnosc" className="text-primary-600 hover:underline">
                  Deklaracja Dostępności
                </Link>
              </li>
              <li>
                <Link href="/zgloszenie" className="text-primary-600 hover:underline">
                  Formularz zgłoszenia nielegalnej treści
                </Link>
              </li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
