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
  const allPhases: PhaseType[] = [
    'PRECONSULTATION',
    'RCL',
    'SEJM',
    'SENAT',
    'PRESIDENT',
    'JOURNAL',
  ];

  const phaseMap = new Map(phases.map((p) => [p.type, p]));

  return (
    <div className="relative">
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {allPhases.map((phaseType, index) => {
          const phase = phaseMap.get(phaseType);
          const isActive = !!phase;
          const isCompleted = phase?.endDate !== null && phase?.endDate !== undefined;

          return (
            <div key={phaseType} className="relative flex items-start">
              <div
                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isActive
                    ? isCompleted
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : 'bg-primary-100 border-primary-500 text-primary-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  phaseIcons[phaseType]
                )}
              </div>

              <div className="ml-4 flex-1">
                {isActive ? (
                  <Link
                    href={`/laws/${lawId}/phases/${phase.id}`}
                    className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {PHASE_LABELS[phaseType]}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(phase.startDate).toLocaleDateString('pl-PL')}
                      {phase.endDate &&
                        ` - ${new Date(phase.endDate).toLocaleDateString('pl-PL')}`}
                    </p>
                  </Link>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-medium text-gray-400">
                      {PHASE_LABELS[phaseType]}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Oczekuje</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
