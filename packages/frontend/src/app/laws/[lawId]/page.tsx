'use client';

import { use } from 'react';
import { useLaw } from '@/features/laws/hooks/useLaws';
import { PhaseTimeline } from '@/features/laws/components/PhaseTimeline';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, User, ArrowLeft, GitCompare, Radar } from 'lucide-react';
import Link from 'next/link';

export default function LawPage({
  params,
}: {
  params: Promise<{ lawId: string }>;
}) {
  const { lawId } = use(params);
  const { data: law, isLoading, error } = useLaw(lawId);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (error || !law) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Nie znaleziono ustawy</p>
        <Link href="/" className="text-primary-600 hover:underline mt-2 inline-block">
          Wróć do listy
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do listy ustaw
      </Link>

      {/* Law info */}
      <Card className="mb-8">
        <CardContent className="py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{law.name}</h1>
          <p className="text-gray-600 mb-4">{law.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {law.author}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Rozpoczęto: {new Date(law.startDate).toLocaleDateString('pl-PL')}
            </span>
            {law.publishDate && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Opublikowano: {new Date(law.publishDate).toLocaleDateString('pl-PL')}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/laws/${lawId}/impact`}>
              <Button variant="primary">
                <Radar className="w-4 h-4 mr-2" />
                Radar Wpływu
              </Button>
            </Link>
            <Link href={`/laws/${lawId}/diff`}>
              <Button variant="secondary">
                <GitCompare className="w-4 h-4 mr-2" />
                Porównaj wersje
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Phase timeline */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Przebieg procesu legislacyjnego
      </h2>
      <PhaseTimeline phases={law.phases} lawId={lawId} />
    </div>
  );
}
