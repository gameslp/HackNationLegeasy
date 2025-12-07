'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Calendar } from 'lucide-react';
import type { Stage, PhaseType } from '@/lib/api/types';

const PHASE_COLORS: Record<PhaseType, { hex: string; light: string; border: string }> = {
  PRECONSULTATION: { hex: '#f97316', light: 'bg-orange-50', border: 'border-orange-200' },
  RCL: { hex: '#0ea5e9', light: 'bg-sky-50', border: 'border-sky-200' },
  SEJM: { hex: '#7c3aed', light: 'bg-violet-50', border: 'border-violet-200' },
  SENAT: { hex: '#16a34a', light: 'bg-green-50', border: 'border-green-200' },
  PRESIDENT: { hex: '#3b82f6', light: 'bg-blue-50', border: 'border-blue-200' },
  JOURNAL: { hex: '#6366f1', light: 'bg-indigo-50', border: 'border-indigo-200' },
};

interface StageGraphProps {
  lawId: string;
  phaseId: string;
  phaseType: PhaseType;
  stages: Stage[];
}

export function StageGraph({ lawId, phaseId, phaseType, stages }: StageGraphProps) {
  if (!stages.length) return null;

  const colors = PHASE_COLORS[phaseType] || PHASE_COLORS.RCL;
  const sorted = [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg"
            style={{ background: `${colors.hex}22`, border: `1px solid ${colors.hex}55` }}
          />
          <div>
            <p className="text-xs text-gray-500">Przepływ etapów</p>
            <p className="text-sm font-semibold text-gray-900">
              {sorted.length} {sorted.length === 1 ? 'etap' : 'etapy'}
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-3 min-w-fit">
          {sorted.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              {/* Stage card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/laws/${lawId}/phases/${phaseId}/stages/${stage.id}`}
                  className="block"
                >
                  <motion.div
                    className={`w-36 p-3 rounded-lg border-2 ${colors.border} ${colors.light}
                               hover:shadow-md transition-all duration-200 cursor-pointer`}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Stage number */}
                    <div
                      className="w-5 h-5 rounded-full text-white text-[10px] font-bold
                                 flex items-center justify-center mb-2"
                      style={{ backgroundColor: colors.hex }}
                    >
                      {idx + 1}
                    </div>

                    {/* Stage name */}
                    <h4 className="font-medium text-gray-900 text-xs leading-tight line-clamp-2 min-h-[2rem] mb-2">
                      {stage.name}
                    </h4>

                    {/* Date */}
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px]">
                        {new Date(stage.date).toLocaleDateString('pl-PL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>

              {/* Connector arrow */}
              {idx < sorted.length - 1 && (
                <div className="flex items-center mx-1">
                  <div
                    className="w-4 h-0.5"
                    style={{ backgroundColor: `${colors.hex}55` }}
                  />
                  <div
                    className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px]
                               border-t-transparent border-b-transparent"
                    style={{ borderLeftColor: `${colors.hex}55` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
