'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { Stage, PhaseType } from '@/lib/api/types';

const PHASE_COLORS: Record<PhaseType, string> = {
  PRECONSULTATION: '#f97316',
  RCL: '#0ea5e9',
  SEJM: '#7c3aed',
  SENAT: '#16a34a',
  PRESIDENT: '#0ea5e9',
  JOURNAL: '#6366f1',
};

interface StageGraphProps {
  lawId: string;
  phaseId: string;
  phaseType: PhaseType;
  stages: Stage[];
}

export function StageGraph({ lawId, phaseId, phaseType, stages }: StageGraphProps) {
  if (!stages.length) return null;

  const color = PHASE_COLORS[phaseType] || '#2563eb';
  const sorted = [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));
  const spacing = 180;
  const nodeRadius = 26;
  const positions = sorted.map((_, idx) => ({
    x: 60 + idx * spacing,
    y: 80,
  }));
  const width = Math.max(sorted.length - 1, 1) * spacing + 120;
  const height = 160;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl shadow-inner"
            style={{ background: `${color}22`, border: `1px solid ${color}55` }}
          />
          <div>
            <p className="text-sm text-gray-500">Przepływ etapów</p>
            <p className="text-lg font-semibold text-gray-900">
              {sorted.length} {sorted.length === 1 ? 'etap' : 'etapy'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500">Kliknij w węzeł, aby przejść do etapu</p>
      </div>

      <div className="relative" style={{ height }}>
        <div className="overflow-x-auto">
          <div className="relative" style={{ width, height }}>
            <svg
              width={width}
              height={height}
              className="absolute inset-0"
              aria-hidden
            >
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
                    stroke={`${color}55`}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>

            {sorted.map((stage, idx) => {
              const pos = positions[idx];
              return (
                <motion.div
                  key={stage.id}
                  className="absolute"
                  style={{
                    left: pos.x - nodeRadius,
                    top: pos.y - nodeRadius,
                    width: nodeRadius * 2,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <Link
                    href={`/laws/${lawId}/phases/${phaseId}/stages/${stage.id}`}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.div
                      className="w-full h-14 rounded-xl shadow-lg flex items-center justify-center text-sm font-semibold text-white"
                      style={{ background: color }}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {stage.name.slice(0, 8)}
                    </motion.div>
                    <div className="text-center w-40">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(stage.date).toLocaleDateString('pl-PL')}
                      </p>
                      <p className="text-sm text-gray-900 font-semibold line-clamp-2">
                        {stage.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
