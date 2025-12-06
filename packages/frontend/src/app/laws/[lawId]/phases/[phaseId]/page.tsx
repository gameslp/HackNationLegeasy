'use client';

import { use } from 'react';
import { useLaw, usePhase } from '@/features/laws/hooks/useLaws';
import { StageCard } from '@/features/laws/components/StageCard';
import { PhaseBadge } from '@/components/ui/Badge';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function PhasePage({
  params,
}: {
  params: Promise<{ lawId: string; phaseId: string }>;
}) {
  const { lawId, phaseId } = use(params);
  const { data: law } = useLaw(lawId);
  const { data: phase, isLoading, error } = usePhase(lawId, phaseId);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (error || !phase) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Nie znaleziono fazy</p>
        <Link
          href={`/laws/${lawId}`}
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Wróć do ustawy
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href={`/laws/${lawId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do {law?.name || 'ustawy'}
      </Link>

      {/* Phase info */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <PhaseBadge phase={phase.type} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {law?.name || 'Ustawa'}
        </h1>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(phase.startDate).toLocaleDateString('pl-PL')}
          {phase.endDate &&
            ` - ${new Date(phase.endDate).toLocaleDateString('pl-PL')}`}
        </div>
      </div>

      {/* Stages */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Etapy</h2>

      {phase.stages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Brak etapów w tej fazie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {phase.stages.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              lawId={lawId}
              phaseId={phaseId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
