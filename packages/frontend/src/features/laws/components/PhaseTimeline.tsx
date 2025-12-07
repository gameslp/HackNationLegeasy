'use client';

import { Phase, PHASE_LABELS, PhaseType } from '@/lib/api/types';
import {
  MessageSquare,
  Building2,
  Landmark,
  Scale,
  Crown,
  BookOpen,
  Check
} from 'lucide-react';
import Link from 'next/link';

const phaseIcons: Record<PhaseType, React.ReactNode> = {
  PRECONSULTATION: <MessageSquare className="w-5 h-5" />,
  RCL: <Building2 className="w-5 h-5" />,
  SEJM: <Landmark className="w-5 h-5" />,
  SENAT: <Scale className="w-5 h-5" />,
  PRESIDENT: <Crown className="w-5 h-5" />,
  JOURNAL: <BookOpen className="w-5 h-5" />,
};

interface PhaseTimelineProps {
  phases: Phase[];
  lawId: string;
}

export function PhaseTimeline({ phases, lawId }: PhaseTimelineProps) {
  // Sortuj fazy według order (powinny już być posortowane z backendu, ale dla pewności)
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  // Znajdź ostatnią aktywną fazę (bez endDate) do pokazania "przyszłych" faz
  const lastPhase = sortedPhases[sortedPhases.length - 1];
  const isCompleted = lastPhase?.type === 'JOURNAL' && lastPhase?.endDate;

  // Określ które fazy jeszcze mogą nastąpić (tylko jeśli ustawa nie jest zakończona)
  const standardPhaseOrder: PhaseType[] = [
    'PRECONSULTATION',
    'RCL',
    'SEJM',
    'SENAT',
    'PRESIDENT',
    'JOURNAL',
  ];

  // Znajdź fazy które jeszcze nie wystąpiły w standardowym procesie
  const existingTypes = new Set(sortedPhases.map(p => p.type));
  const futurePhases: PhaseType[] = [];

  if (!isCompleted && lastPhase) {
    const lastTypeIndex = standardPhaseOrder.indexOf(lastPhase.type);
    for (let i = lastTypeIndex + 1; i < standardPhaseOrder.length; i++) {
      // Dodaj tylko jeśli faza tego typu jeszcze nie wystąpiła
      // lub jest to typ który może się powtórzyć (SEJM, SENAT)
      const phaseType = standardPhaseOrder[i];
      if (!existingTypes.has(phaseType)) {
        futurePhases.push(phaseType);
      }
    }
  }

  return (
    <div className="relative">
      <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-200 via-gray-200 to-gray-100 rounded-full" />

      <div className="space-y-8">
        {/* Istniejące fazy */}
        {sortedPhases.map((phase, index) => {
          const isPhaseCompleted = phase.endDate !== null && phase.endDate !== undefined;

          // Sprawdź czy ta sama faza tego typu już wystąpiła wcześniej (np. drugi SEJM)
          const sameTypeBefore = sortedPhases.slice(0, index).filter(p => p.type === phase.type).length;
          const phaseLabel = sameTypeBefore > 0
            ? `${PHASE_LABELS[phase.type]} (${sameTypeBefore + 1})`
            : PHASE_LABELS[phase.type];

          return (
            <div key={phase.id} className="relative flex items-start group">
              <div
                className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl border-2 shadow-md transition-all duration-300 ${
                  isPhaseCompleted
                    ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400 text-green-600 shadow-green-200 group-hover:scale-110'
                    : 'bg-gradient-to-br from-primary-100 to-blue-100 border-primary-400 text-primary-600 shadow-primary-200 group-hover:scale-110'
                }`}
              >
                {isPhaseCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  phaseIcons[phase.type]
                )}
              </div>

              <div className="ml-6 flex-1">
                <Link
                  href={`/laws/${lawId}/phases/${phase.id}`}
                  className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1"
                >
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-primary-600 transition-colors">
                    {phaseLabel}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 font-medium">
                    {new Date(phase.startDate).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {phase.endDate &&
                      ` - ${new Date(phase.endDate).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}`}
                  </p>
                </Link>
              </div>
            </div>
          );
        })}

        {/* Przyszłe fazy (nieaktywne) */}
        {futurePhases.map((phaseType) => (
          <div key={`future-${phaseType}`} className="relative flex items-start">
            <div className="relative z-10 flex items-center justify-center w-14 h-14 rounded-xl border-2 shadow-md bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-400">
              {phaseIcons[phaseType]}
            </div>

            <div className="ml-6 flex-1">
              <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 backdrop-blur-sm">
                <h3 className="font-semibold text-gray-400">
                  {PHASE_LABELS[phaseType]}
                </h3>
                <p className="text-sm text-gray-400 mt-2">Oczekuje na rozpoczęcie</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
