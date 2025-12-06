'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { PhaseBadge } from '@/components/ui/Badge';
import { Law } from '@/lib/api/types';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';

interface LawCardProps {
  law: Law;
}

export function LawCard({ law }: LawCardProps) {
  return (
    <Link href={`/laws/${law.id}`} className="group">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {law.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {law.description}
              </p>
            </div>
            {law.currentPhase && (
              <div className="flex-shrink-0">
                <PhaseBadge phase={law.currentPhase} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span className="font-medium">{law.author}</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-medium">
                {new Date(law.startDate).toLocaleDateString('pl-PL')}
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
