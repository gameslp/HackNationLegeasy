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

const phaseVariants: Record<PhaseType, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
  PRECONSULTATION: 'default',
  RCL: 'info',
  SEJM: 'warning',
  SENAT: 'warning',
  PRESIDENT: 'info',
  JOURNAL: 'success',
};

export function PhaseBadge({ phase }: { phase: PhaseType }) {
  return <Badge variant={phaseVariants[phase]}>{PHASE_LABELS[phase]}</Badge>;
}
