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
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link
        href={`/laws/${lawId}`}
        className="inline-flex items-center text-gray-600 hover:text-primary-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Wróć do {law?.name || 'ustawy'}
      </Link>

      {/* Phase info */}
      <div className="relative">
        <div className="absolute -top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/40 to-primary-200/20 rounded-full blur-3xl -z-10" />
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200/60">
          <div className="flex items-center space-x-3 mb-4">
            <PhaseBadge phase={phase.type} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {law?.name || 'Ustawa'}
          </h1>
          <div className="flex items-center text-sm text-gray-500 bg-white/60 rounded-lg px-4 py-2 inline-flex">
            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
            {new Date(phase.startDate).toLocaleDateString('pl-PL')}
            {phase.endDate &&
              ` - ${new Date(phase.endDate).toLocaleDateString('pl-PL')}`}
          </div>
        </div>
      </div>

      {/* Stages */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full mr-3"></span>
          Etapy
        </h2>

        {phase.stages.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <p className="text-gray-600">Brak etapów w tej fazie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {phase.stages.map((stage, index) => (
              <div
                key={stage.id}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StageCard
                  stage={stage}
                  lawId={lawId}
                  phaseId={phaseId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
