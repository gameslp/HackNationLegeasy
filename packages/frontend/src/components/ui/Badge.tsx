import { ReactNode } from 'react';
import { PhaseType, PHASE_LABELS } from '@/lib/api/types';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  info: 'bg-blue-100 text-blue-700',
  danger: 'bg-red-100 text-red-700',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
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
