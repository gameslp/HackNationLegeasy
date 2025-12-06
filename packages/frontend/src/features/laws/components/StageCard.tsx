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
    <Link href={`/laws/${lawId}/phases/${phaseId}/stages/${stage.id}`}>
      <Card className="hover:border-primary-300 transition-colors">
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{stage.name}</h4>
              {stage.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {stage.description}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(stage.date).toLocaleDateString('pl-PL')}
                </span>
                {stage.author && (
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {stage.author}
                  </span>
                )}
              </div>
            </div>
            {stage.lawTextContent && (
              <div className="ml-4">
                <FileText className="w-5 h-5 text-primary-500" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
