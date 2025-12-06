'use client';

import { use } from 'react';
import { useLaw } from '@/features/laws/hooks/useLaws';
import { PhaseTimeline } from '@/features/laws/components/PhaseTimeline';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, User, ArrowLeft, GitCompare } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center text-gray-600 hover:text-primary-700 transition-colors group mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Wróć do listy ustaw
      </Link>

      {/* Law info */}
      <div className="relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -z-10" />
        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">{law.name}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{law.description}</p>
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
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link href={`/laws/${lawId}/diff`}>
              <Button variant="secondary" className="group">
                <GitCompare className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Porównaj wersje
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Phase timeline */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full mr-3"></span>
          Przebieg procesu legislacyjnego
        </h2>
        <PhaseTimeline phases={law.phases} lawId={lawId} />
      </div>
    </div>
  );
}
