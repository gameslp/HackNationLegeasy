'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Send, CheckCircle, Info } from 'lucide-react';

type ReportType = 'illegal_content' | 'harmful_content' | 'misinformation' | 'other';

interface ReportForm {
  contentUrl: string;
  reportType: ReportType;
  description: string;
  legalBasis: string;
  reporterName: string;
  reporterEmail: string;
  goodFaithStatement: boolean;
}

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'illegal_content',
    label: 'Treści nielegalne',
    description: 'Treści naruszające prawo (np. zniesławienie, groźby, mowa nienawiści)',
  },
  {
    value: 'harmful_content',
    label: 'Treści szkodliwe',
    description: 'Treści mogące wyrządzić szkodę, ale niekoniecznie nielegalne',
  },
  {
    value: 'misinformation',
    label: 'Dezinformacja',
    description: 'Fałszywe lub wprowadzające w błąd informacje',
  },
  {
    value: 'other',
    label: 'Inne',
    description: 'Inne naruszenie regulaminu serwisu',
  },
];

export default function ReportPage() {
  const [form, setForm] = useState<ReportForm>({
    contentUrl: '',
    reportType: 'illegal_content',
    description: '',
    legalBasis: '',
    reporterName: '',
    reporterEmail: '',
    goodFaithStatement: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - in production this would be a real endpoint
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate report ID
    const id = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setReportId(id);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const isFormValid =
    form.contentUrl &&
    form.description &&
    form.goodFaithStatement &&
    (form.reportType !== 'illegal_content' || form.legalBasis);

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Zgłoszenie zostało przyjęte
            </h1>
            <p className="text-gray-600 mb-6">
              Dziękujemy za zgłoszenie. Rozpatrzymy je zgodnie z procedurą określoną
              w Akcie o Usługach Cyfrowych (DSA).
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500 mb-1">Numer zgłoszenia:</p>
              <p className="text-lg font-mono font-bold text-gray-900">{reportId}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Co dalej?</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Rozpatrzymy zgłoszenie w ciągu 7 dni roboczych</li>
                    <li>Jeśli podano adres e-mail, otrzymasz powiadomienie o decyzji</li>
                    <li>Możesz śledzić status zgłoszenia podając jego numer</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="secondary">Wróć do strony głównej</Button>
              </Link>
              <Button onClick={() => { setIsSubmitted(false); setForm({ ...form, contentUrl: '', description: '', legalBasis: '' }); }}>
                Zgłoś kolejną treść
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
      >
        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
        Powrót do strony głównej
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Zgłoś nielegalną treść</h1>
              <p className="text-sm text-gray-500">Zgodnie z art. 16 Aktu o Usługach Cyfrowych (DSA)</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-blue-800">
                <p>
                  Ten formularz służy do zgłaszania treści, które uważasz za nielegalne
                  lub naruszające regulamin serwisu. Każde zgłoszenie jest rozpatrywane
                  indywidualnie przez nasz zespół.
                </p>
                <p className="mt-2">
                  Więcej informacji:{' '}
                  <Link href="/dsa" className="font-medium underline">
                    Akt o Usługach Cyfrowych (DSA)
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content URL */}
            <div>
              <label htmlFor="contentUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Link do treści <span className="text-red-500">*</span>
              </label>
              <Input
                id="contentUrl"
                type="url"
                placeholder="https://legeasy.pl/laws/..."
                value={form.contentUrl}
                onChange={(e) => setForm({ ...form, contentUrl: e.target.value })}
                required
                aria-describedby="contentUrl-help"
              />
              <p id="contentUrl-help" className="mt-1 text-xs text-gray-500">
                Podaj dokładny adres URL strony zawierającej zgłaszaną treść
              </p>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rodzaj zgłoszenia <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {REPORT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.reportType === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={form.reportType === type.value}
                      onChange={(e) => setForm({ ...form, reportType: e.target.value as ReportType })}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Opis problemu <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Opisz, dlaczego uważasz tę treść za nielegalną lub szkodliwą..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                required
                aria-describedby="description-help"
              />
              <p id="description-help" className="mt-1 text-xs text-gray-500">
                Podaj szczegółowe uzasadnienie zgłoszenia
              </p>
            </div>

            {/* Legal Basis (for illegal content) */}
            {form.reportType === 'illegal_content' && (
              <div>
                <label htmlFor="legalBasis" className="block text-sm font-medium text-gray-700 mb-1">
                  Podstawa prawna <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="legalBasis"
                  placeholder="Wskaż przepis prawa, który Twoim zdaniem narusza ta treść..."
                  value={form.legalBasis}
                  onChange={(e) => setForm({ ...form, legalBasis: e.target.value })}
                  rows={2}
                  required
                  aria-describedby="legalBasis-help"
                />
                <p id="legalBasis-help" className="mt-1 text-xs text-gray-500">
                  Np. art. 212 Kodeksu karnego (zniesławienie), art. 190 KK (groźby) itp.
                </p>
              </div>
            )}

            {/* Contact Info */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Dane kontaktowe (opcjonalne)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Podanie danych kontaktowych umożliwi nam przekazanie informacji o podjętych działaniach.
                Dane nie są wymagane, chyba że zgłoszenie dotyczy treści związanych z
                wykorzystywaniem seksualnym dzieci.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reporterName" className="block text-sm font-medium text-gray-700 mb-1">
                    Imię i nazwisko / Nazwa
                  </label>
                  <Input
                    id="reporterName"
                    type="text"
                    placeholder="Jan Kowalski"
                    value={form.reporterName}
                    onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="reporterEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres e-mail
                  </label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    placeholder="jan@example.com"
                    value={form.reporterEmail}
                    onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Good Faith Statement */}
            <div className="border-t pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.goodFaithStatement}
                  onChange={(e) => setForm({ ...form, goodFaithStatement: e.target.checked })}
                  className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  required
                />
                <span className="text-sm text-gray-700">
                  <span className="text-red-500">*</span>{' '}
                  Oświadczam, że niniejsze zgłoszenie składam w dobrej wierze i że informacje
                  w nim zawarte są, według mojej najlepszej wiedzy, dokładne i kompletne.
                  Rozumiem, że celowe składanie fałszywych zgłoszeń może skutkować
                  konsekwencjami prawnymi.
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Link href="/" className="flex-1">
                <Button variant="secondary" className="w-full" type="button">
                  Anuluj
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  'Wysyłanie...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                    Wyślij zgłoszenie
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
