'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Stage } from '@/lib/api/types';
import { Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';

interface StageCardProps {
  stage: Stage;
  lawId: string;
  phaseId: string;
}

export function StageCard({ stage, lawId, phaseId }: StageCardProps) {
  return (
    <Link href={`/laws/${lawId}/phases/${phaseId}/stages/${stage.id}`} className="group">
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {stage.name}
              </h4>
              {stage.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                  {stage.description}
                </p>
              )}
            </div>
            {stage.lawTextContent && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-blue-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-110">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">
                {new Date(stage.date).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </span>
            {stage.author && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{stage.author}</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
