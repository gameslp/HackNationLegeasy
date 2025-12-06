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
    <Link href={`/laws/${law.id}`}>
      <Card className="hover:border-primary-300 transition-colors">
        <CardContent>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {law.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {law.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {law.author}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(law.startDate).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
            {law.currentPhase && (
              <div className="ml-4">
                <PhaseBadge phase={law.currentPhase} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
