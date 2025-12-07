'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { Stage, PhaseType } from '@/lib/api/types';

const PHASE_ORDER: PhaseType[] = [
  'PRECONSULTATION',
  'RCL',
  'SEJM',
  'SENAT',
  'PRESIDENT',
  'JOURNAL',
];

const PHASE_COLORS: Record<PhaseType, string> = {
  PRECONSULTATION: '#f97316',
  RCL: '#0ea5e9',
  SEJM: '#7c3aed',
  SENAT: '#16a34a',
  PRESIDENT: '#0ea5e9',
  JOURNAL: '#6366f1',
};

interface StageProcessGraphProps {
  lawId: string;
  stages: Stage[];
}

export function StageProcessGraph({ lawId, stages }: StageProcessGraphProps) {
  if (!stages.length) return null;

  const withPhase = stages.filter((s) => !!s.phaseType);
  const sorted = [...withPhase].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return (a.order || 0) - (b.order || 0);
  });

  const spacingX = 160;
  const rowHeight = 120;
  const nodeRadius = 26;

  const positions = sorted.map((stage, idx) => {
    const yIndex = Math.max(
      0,
      PHASE_ORDER.findIndex((p) => p === stage.phaseType) ?? 0
    );
    return {
      stage,
      x: 80 + idx * spacingX,
      y: 60 + yIndex * rowHeight,
      color: PHASE_COLORS[stage.phaseType as PhaseType] || '#2563eb',
    };
  });

  const width = Math.max(positions.length - 1, 1) * spacingX + 200;
  const height = PHASE_ORDER.length * rowHeight + 60;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-lg p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-md">
            {positions.length}
          </div>
          <div>
            <p className="text-sm text-gray-500">Mapa etapów całego procesu</p>
            <p className="text-lg font-semibold text-gray-900">
              {positions.length} {positions.length === 1 ? 'etap' : 'etapy'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">Kliknij w węzeł, aby przejść do etapu</p>
      </div>

      <div className="relative overflow-x-auto">
        <div className="relative" style={{ width, height }}>
          <svg width={width} height={height} className="absolute inset-0" aria-hidden>
            {positions.map((pos, idx) => {
              const next = positions[idx + 1];
              if (!next) return null;
              return (
                <line
                  key={`edge-${idx}`}
                  x1={pos.x}
                  y1={pos.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={`${pos.color}66`}
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>

          {positions.map((pos, idx) => (
            <motion.div
              key={pos.stage.id}
              className="absolute"
              style={{
                left: pos.x - nodeRadius,
                top: pos.y - nodeRadius,
                width: nodeRadius * 2,
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={`/laws/${lawId}/phases/${pos.stage.phaseId}/stages/${pos.stage.id}`}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  className="w-full h-14 rounded-xl shadow-lg flex items-center justify-center text-sm font-semibold text-white"
                  style={{ background: pos.color }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {pos.stage.name.slice(0, 8)}
                </motion.div>
                <div className="text-center w-44">
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(pos.stage.date).toLocaleDateString('pl-PL')}
                  </p>
                  <p className="text-sm text-gray-900 font-semibold line-clamp-2">
                    {pos.stage.name}
                  </p>
                  {pos.stage.phaseType && (
                    <p className="text-[11px] font-medium text-gray-500 mt-1">
                      {pos.stage.phaseType}
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 text-xs text-gray-600">
        {PHASE_ORDER.map((phase) => (
          <span
            key={phase}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full border"
            style={{ borderColor: `${(PHASE_COLORS[phase] || '#94a3b8')}55` }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: PHASE_COLORS[phase] || '#94a3b8' }}
            />
            {phase}
          </span>
        ))}
      </div>
    </div>
  );
}
