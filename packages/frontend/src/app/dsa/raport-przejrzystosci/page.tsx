import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, FileText, BarChart3, Clock, Users, Shield, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Raport Przejrzystości DSA | Legeasy',
  description: 'Roczny raport przejrzystości serwisu Legeasy zgodnie z art. 15 Aktu o Usługach Cyfrowych (DSA)',
};

// In production, this would come from a database/API
const REPORT_DATA = {
  period: {
    start: '2024-02-17',
    end: '2024-12-31',
  },
  stats: {
    totalReports: 0,
    reportsFromUsers: 0,
    reportsFromAuthorities: 0,
    reportsFromTrustedFlaggers: 0,
    contentRemoved: 0,
    contentRestricted: 0,
    accountsSuspended: 0,
    appealsReceived: 0,
    appealsUpheld: 0,
    averageProcessingTime: 'N/A',
  },
  automatedModeration: {
    used: true,
    description: 'System automatycznie wykrywa potencjalne dane osobowe (numery telefonów, adresy email, PESEL) w komentarzach.',
    actionsFromAutomation: 0,
    errorRate: 'N/A',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  description
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}

export default function TransparencyReportPage() {
  const reportDate = new Date().toLocaleDateString('pl-PL');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/dsa"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Powrót do informacji DSA
      </Link>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Raport Przejrzystości
              </h1>
              <p className="text-gray-600">
                Zgodnie z art. 15 Aktu o Usługach Cyfrowych (DSA)
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-blue-800">Okres sprawozdawczy</p>
                <p className="text-sm text-blue-700">
                  {new Date(REPORT_DATA.period.start).toLocaleDateString('pl-PL')} -{' '}
                  {new Date(REPORT_DATA.period.end).toLocaleDateString('pl-PL')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Data publikacji raportu: {reportDate}
                </p>
              </div>
            </div>
          </div>

          {/* Main Statistics */}
          <section className="mb-8" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" aria-hidden="true" />
              Statystyki moderacji treści
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <StatCard
                icon={AlertTriangle}
                label="Otrzymane zgłoszenia"
                value={REPORT_DATA.stats.totalReports}
                description="Łączna liczba zgłoszeń nielegalnych treści"
              />
              <StatCard
                icon={Shield}
                label="Usunięte treści"
                value={REPORT_DATA.stats.contentRemoved}
                description="Treści usunięte w wyniku moderacji"
              />
              <StatCard
                icon={Users}
                label="Zawieszone konta"
                value={REPORT_DATA.stats.accountsSuspended}
                description="Konta użytkowników zawieszone lub zablokowane"
              />
            </div>
          </section>

          {/* Detailed Breakdown */}
          <section className="mb-8" aria-labelledby="breakdown-heading">
            <h2 id="breakdown-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Szczegółowy podział zgłoszeń
            </h2>

            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Kategoria</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Liczba</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4">Zgłoszenia od użytkowników</td>
                    <td className="text-right py-3 px-4 font-medium">{REPORT_DATA.stats.reportsFromUsers}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4">Nakazy od organów państwowych</td>
                    <td className="text-right py-3 px-4 font-medium">{REPORT_DATA.stats.reportsFromAuthorities}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4">Zgłoszenia od zaufanych podmiotów sygnalizujących</td>
                    <td className="text-right py-3 px-4 font-medium">{REPORT_DATA.stats.reportsFromTrustedFlaggers}</td>
                  </tr>
                  <tr className="border-t border-gray-200 bg-gray-100">
                    <td className="py-3 px-4 font-medium">Razem</td>
                    <td className="text-right py-3 px-4 font-bold">{REPORT_DATA.stats.totalReports}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Moderation Actions */}
          <section className="mb-8" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Podjęte działania moderacyjne
            </h2>

            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Rodzaj działania</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Liczba</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4">Usunięcie treści</td>
                    <td className="text-right py-3 px-4 font-medium">{REPORT_DATA.stats.contentRemoved}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4">Ograniczenie widoczności</td>
                    <td className="text-right py-3 px-4 font-medium">{REPORT_DATA.stats.contentRestricted}</td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="py-3 px-4">Zawieszenie konta</td>
                    <td className="text-right py-3 px-4 font-medium">{REPORT_DATA.stats.accountsSuspended}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Appeals */}
          <section className="mb-8" aria-labelledby="appeals-heading">
            <h2 id="appeals-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Odwołania
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Otrzymane odwołania</p>
                <p className="text-2xl font-bold text-gray-900">{REPORT_DATA.stats.appealsReceived}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Odwołania uwzględnione</p>
                <p className="text-2xl font-bold text-gray-900">{REPORT_DATA.stats.appealsUpheld}</p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section className="mb-8" aria-labelledby="time-heading">
            <h2 id="time-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Czas rozpatrywania zgłoszeń
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary-600" aria-hidden="true" />
                <div>
                  <p className="text-sm text-gray-600">Średni czas rozpatrywania</p>
                  <p className="text-xl font-bold text-gray-900">{REPORT_DATA.stats.averageProcessingTime}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Zgodnie z DSA, zgłoszenia są rozpatrywane niezwłocznie, nie później niż w ciągu 7 dni.
              </p>
            </div>
          </section>

          {/* Automated Moderation */}
          <section className="mb-8" aria-labelledby="automation-heading">
            <h2 id="automation-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Zautomatyzowane narzędzia moderacji
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-gray-900 mb-2">
                    {REPORT_DATA.automatedModeration.used ? 'Stosowane' : 'Niestosowane'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {REPORT_DATA.automatedModeration.description}
                  </p>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Działania podjęte automatycznie</p>
                      <p className="font-medium">{REPORT_DATA.automatedModeration.actionsFromAutomation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Wskaźnik błędów</p>
                      <p className="font-medium">{REPORT_DATA.automatedModeration.errorRate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Wszystkie automatyczne decyzje podlegają weryfikacji przez personel.
              Użytkownicy mają prawo odwołać się od każdej decyzji moderacyjnej.
            </p>
          </section>

          {/* Active Users */}
          <section className="mb-8" aria-labelledby="users-heading">
            <h2 id="users-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Informacje o użytkownikach
            </h2>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Średnia miesięczna liczba aktywnych odbiorców usługi w UE:
              </p>
              <p className="text-xl font-bold text-gray-900">
                Poniżej 45 milionów
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Serwis Legeasy nie jest klasyfikowany jako bardzo duża platforma internetowa (VLOP)
                w rozumieniu art. 33 DSA.
              </p>
            </div>
          </section>

          {/* Methodology */}
          <section className="mb-8" aria-labelledby="methodology-heading">
            <h2 id="methodology-heading" className="text-xl font-semibold text-gray-900 mb-4">
              Metodologia
            </h2>
            <p className="text-sm text-gray-600">
              Dane w niniejszym raporcie zostały zebrane z wewnętrznych systemów serwisu Legeasy.
              Statystyki są aktualizowane na bieżąco i publikowane w formie rocznego raportu
              zgodnie z wymogami art. 15 Aktu o Usługach Cyfrowych.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-500">
              Pytania dotyczące tego raportu można kierować na adres:{' '}
              <a href="mailto:dsa@legeasy.pl" className="text-primary-600 hover:underline">
                dsa@legeasy.pl
              </a>
            </p>
            <div className="mt-4">
              <Link
                href="/dsa"
                className="text-primary-600 hover:underline text-sm"
              >
                Powrót do informacji o DSA
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
