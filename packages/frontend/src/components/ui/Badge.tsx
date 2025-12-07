import { ReactNode } from 'react';
import { PhaseType, PHASE_LABELS } from '@/lib/api/types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 ring-1 ring-green-200',
  warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 ring-1 ring-yellow-200',
  info: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 ring-1 ring-blue-200',
  danger: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 ring-1 ring-red-200',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Colors matching StageProcessGraph for visual consistency
const PHASE_BADGE_COLORS: Record<PhaseType, string> = {
  PRECONSULTATION: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 ring-1 ring-orange-200',
  RCL: 'bg-gradient-to-r from-sky-50 to-sky-100 text-sky-700 ring-1 ring-sky-200',
  SEJM: 'bg-gradient-to-r from-violet-50 to-violet-100 text-violet-700 ring-1 ring-violet-200',
  SENAT: 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 ring-1 ring-green-200',
  PRESIDENT: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 ring-1 ring-blue-200',
  JOURNAL: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
};

export function PhaseBadge({ phase }: { phase: PhaseType }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${PHASE_BADGE_COLORS[phase]}`}
    >
      {PHASE_LABELS[phase]}
    </span>
  );
}
