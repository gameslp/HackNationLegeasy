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

// Colors matching StageProcessGraph for visual consistency
const PHASE_COLORS: Record<PhaseType, {
  bg: string;
  bgLight: string;
  border: string;
  text: string;
  hoverBorder: string;
  hoverText: string;
}> = {
  PRECONSULTATION: {
    bg: 'bg-orange-500',
    bgLight: 'from-orange-100 to-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-600',
    hoverBorder: 'hover:border-orange-300',
    hoverText: 'group-hover:text-orange-600',
  },
  RCL: {
    bg: 'bg-sky-500',
    bgLight: 'from-sky-100 to-sky-50',
    border: 'border-sky-400',
    text: 'text-sky-600',
    hoverBorder: 'hover:border-sky-300',
    hoverText: 'group-hover:text-sky-600',
  },
  SEJM: {
    bg: 'bg-violet-500',
    bgLight: 'from-violet-100 to-violet-50',
    border: 'border-violet-400',
    text: 'text-violet-600',
    hoverBorder: 'hover:border-violet-300',
    hoverText: 'group-hover:text-violet-600',
  },
  SENAT: {
    bg: 'bg-green-500',
    bgLight: 'from-green-100 to-green-50',
    border: 'border-green-400',
    text: 'text-green-600',
    hoverBorder: 'hover:border-green-300',
    hoverText: 'group-hover:text-green-600',
  },
  PRESIDENT: {
    bg: 'bg-blue-500',
    bgLight: 'from-blue-100 to-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-600',
    hoverBorder: 'hover:border-blue-300',
    hoverText: 'group-hover:text-blue-600',
  },
  JOURNAL: {
    bg: 'bg-indigo-500',
    bgLight: 'from-indigo-100 to-indigo-50',
    border: 'border-indigo-400',
    text: 'text-indigo-600',
    hoverBorder: 'hover:border-indigo-300',
    hoverText: 'group-hover:text-indigo-600',
  },
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
          const colors = PHASE_COLORS[phase.type];

          // Sprawdź czy ta sama faza tego typu już wystąpiła wcześniej (np. drugi SEJM)
          const sameTypeBefore = sortedPhases.slice(0, index).filter(p => p.type === phase.type).length;
          const phaseLabel = sameTypeBefore > 0
            ? `${PHASE_LABELS[phase.type]} (${sameTypeBefore + 1})`
            : PHASE_LABELS[phase.type];

          return (
            <div key={phase.id} className="relative flex items-start group">
              <div
                className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl border-2 shadow-md transition-all duration-300 bg-gradient-to-br ${colors.bgLight} ${colors.border} ${colors.text} group-hover:scale-110`}
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
                  className={`block p-5 bg-white rounded-xl border border-gray-200 ${colors.hoverBorder} hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1`}
                >
                  <h3 className={`font-bold text-gray-900 text-base ${colors.hoverText} transition-colors`}>
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
        {futurePhases.map((phaseType) => {
          const colors = PHASE_COLORS[phaseType];
          return (
            <div key={`future-${phaseType}`} className="relative flex items-start opacity-50">
              <div className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-xl border-2 shadow-md bg-gradient-to-br ${colors.bgLight} ${colors.border} ${colors.text}`}>
                {phaseIcons[phaseType]}
              </div>

              <div className="ml-6 flex-1">
                <div className="p-5 bg-gray-50/50 rounded-xl border border-gray-200 backdrop-blur-sm">
                  <h3 className={`font-semibold ${colors.text}`}>
                    {PHASE_LABELS[phaseType]}
                  </h3>
                  <p className="text-sm text-gray-400 mt-2">Oczekuje na rozpoczęcie</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
