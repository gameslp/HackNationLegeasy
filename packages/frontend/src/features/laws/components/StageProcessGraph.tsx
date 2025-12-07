'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { Stage, PhaseType } from '@/lib/api/types';
import { ArrowRight, Calendar } from 'lucide-react';

const PHASE_ORDER: PhaseType[] = [
  'PRECONSULTATION',
  'RCL',
  'SEJM',
  'SENAT',
  'PRESIDENT',
  'JOURNAL',
];

const PHASE_LABELS: Record<PhaseType, string> = {
  PRECONSULTATION: 'Prekonsultacje',
  RCL: 'RCL',
  SEJM: 'Sejm',
  SENAT: 'Senat',
  PRESIDENT: 'Prezydent',
  JOURNAL: 'Dziennik Ustaw',
};

const PHASE_COLORS: Record<PhaseType, { hex: string; bg: string; border: string; text: string; light: string }> = {
  PRECONSULTATION: { hex: '#f97316', bg: 'bg-orange-500', border: 'border-orange-300', text: 'text-orange-700', light: 'bg-orange-50' },
  RCL: { hex: '#0ea5e9', bg: 'bg-sky-500', border: 'border-sky-300', text: 'text-sky-700', light: 'bg-sky-50' },
  SEJM: { hex: '#8b5cf6', bg: 'bg-violet-500', border: 'border-violet-300', text: 'text-violet-700', light: 'bg-violet-50' },
  SENAT: { hex: '#22c55e', bg: 'bg-green-500', border: 'border-green-300', text: 'text-green-700', light: 'bg-green-50' },
  PRESIDENT: { hex: '#3b82f6', bg: 'bg-blue-500', border: 'border-blue-300', text: 'text-blue-700', light: 'bg-blue-50' },
  JOURNAL: { hex: '#6366f1', bg: 'bg-indigo-500', border: 'border-indigo-300', text: 'text-indigo-700', light: 'bg-indigo-50' },
};

interface StageProcessGraphProps {
  lawId: string;
  stages: Stage[];
}

export function StageProcessGraph({ lawId, stages }: StageProcessGraphProps) {
  if (!stages.length) return null;

  const withPhase = stages.filter((s) => !!s.phaseType);

  // Sort chronologically
  const sorted = [...withPhase].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return (a.order || 0) - (b.order || 0);
  });

  // Count stages per phase for legend
  const phaseCount = PHASE_ORDER.reduce((acc, phase) => {
    acc[phase] = withPhase.filter((s) => s.phaseType === phase).length;
    return acc;
  }, {} as Record<PhaseType, number>);

  // Graph dimensions - compact
  const boxWidth = 140;
  const boxHeight = 70;
  const spacingX = 170;
  const spacingY = 85;
  const paddingLeft = 100;
  const paddingTop = 20;
  const paddingRight = 30;
  const paddingBottom = 20;

  // Calculate positions
  const positions = sorted.map((stage, idx) => {
    const phaseIndex = PHASE_ORDER.indexOf(stage.phaseType as PhaseType);
    const colors = PHASE_COLORS[stage.phaseType as PhaseType] || PHASE_COLORS.RCL;
    return {
      stage,
      x: paddingLeft + idx * spacingX,
      y: paddingTop + phaseIndex * spacingY,
      colors,
    };
  });

  const graphWidth = paddingLeft + (sorted.length - 1) * spacingX + paddingRight + boxWidth;
  const graphHeight = paddingTop + (PHASE_ORDER.length - 1) * spacingY + paddingBottom + boxHeight;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              {sorted.length}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mapa procesu legislacyjnego</h3>
              <p className="text-sm text-gray-500">
                Przebieg {sorted.length} {sorted.length === 1 ? 'etapu' : 'etapów'} przez fazy
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
            <span>Czas</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="px-3 py-4 overflow-x-auto">
        <div className="relative" style={{ minWidth: graphWidth, height: graphHeight }}>
          {/* Phase labels on Y axis */}
          {PHASE_ORDER.map((phase, idx) => {
            const hasStages = phaseCount[phase] > 0;
            const colors = PHASE_COLORS[phase];
            return (
              <div
                key={phase}
                className="absolute left-0 flex items-center gap-1.5"
                style={{ top: paddingTop + idx * spacingY + boxHeight / 2 - 8 }}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-opacity ${hasStages ? '' : 'opacity-30'}`}
                  style={{ backgroundColor: colors.hex }}
                />
                <span className={`text-[10px] font-medium transition-opacity ${hasStages ? 'text-gray-600' : 'text-gray-400'}`}>
                  {PHASE_LABELS[phase]}
                </span>
              </div>
            );
          })}

          {/* Horizontal grid lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', minWidth: graphWidth }}
            height={graphHeight}
          >
            {PHASE_ORDER.map((phase, idx) => (
              <line
                key={`grid-${phase}`}
                x1={paddingLeft - 10}
                y1={paddingTop + idx * spacingY + boxHeight / 2}
                x2="100%"
                y2={paddingTop + idx * spacingY + boxHeight / 2}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}
          </svg>

          {/* Connecting lines between boxes */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={graphWidth}
            height={graphHeight}
          >
            <defs>
              {/* Create gradient for each connection */}
              {positions.map((pos, idx) => {
                const next = positions[idx + 1];
                if (!next) return null;
                return (
                  <linearGradient
                    key={`grad-${idx}`}
                    id={`gradient-${idx}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={pos.colors.hex} />
                    <stop offset="50%" stopColor={pos.colors.hex} />
                    <stop offset="50%" stopColor={next.colors.hex} />
                    <stop offset="100%" stopColor={next.colors.hex} />
                  </linearGradient>
                );
              })}
            </defs>
            {positions.map((pos, idx) => {
              const next = positions[idx + 1];
              if (!next) return null;

              const startX = pos.x + boxWidth;
              const startY = pos.y + boxHeight / 2;
              const endX = next.x;
              const endY = next.y + boxHeight / 2;
              const samePhase = pos.y === next.y;

              if (samePhase) {
                // Straight horizontal line for same phase
                return (
                  <motion.line
                    key={`line-${idx}`}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={pos.colors.hex}
                    strokeWidth={3}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                  />
                );
              }

              // Curved path for different phases with gradient
              const midX = (startX + endX) / 2;

              return (
                <motion.path
                  key={`line-${idx}`}
                  d={`M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`}
                  fill="none"
                  stroke={`url(#gradient-${idx})`}
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                />
              );
            })}
          </svg>

          {/* Stage boxes */}
          {positions.map((pos, idx) => (
            <motion.div
              key={pos.stage.id}
              className="absolute"
              style={{
                left: pos.x,
                top: pos.y,
                width: boxWidth,
                height: boxHeight,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
            >
              <Link
                href={`/laws/${lawId}/phases/${pos.stage.phaseId}/stages/${pos.stage.id}`}
                className="block h-full"
              >
                <motion.div
                  className={`h-full p-2 rounded-lg border-2 ${pos.colors.border} ${pos.colors.light}
                             shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
                             flex flex-col justify-between`}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Stage number badge */}
                  <div
                    className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${pos.colors.bg}
                               text-white text-[10px] font-bold flex items-center justify-center shadow
                               ring-2 ring-white`}
                  >
                    {idx + 1}
                  </div>

                  {/* Stage name */}
                  <h4 className="font-semibold text-gray-900 text-[11px] leading-tight line-clamp-2">
                    {pos.stage.name}
                  </h4>

                  {/* Date */}
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                    <span className="text-[9px]">
                      {new Date(pos.stage.date).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium text-gray-500">Fazy:</span>
          {PHASE_ORDER.map((phase) => {
            const count = phaseCount[phase];
            const hasStages = count > 0;
            const colors = PHASE_COLORS[phase];
            return (
              <div
                key={phase}
                className={`flex items-center gap-1.5 text-xs transition-opacity ${hasStages ? '' : 'opacity-40'}`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: colors.hex }}
                />
                <span className={hasStages ? 'text-gray-700 font-medium' : 'text-gray-400'}>
                  {PHASE_LABELS[phase]}
                </span>
                {hasStages && <span className="text-gray-400">({count})</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
