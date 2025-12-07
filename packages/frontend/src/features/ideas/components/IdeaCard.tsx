'use client';

import Link from 'next/link';
import {
  Idea,
  IDEA_AREA_LABELS,
  IDEA_STATUS_LABELS,
  IDEA_STAGE_LABELS,
} from '@/lib/api/types';
import {
  Lightbulb,
  Building2,
  Calendar,
  MessageSquare,
  Users,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  COLLECTING: 'bg-green-100 text-green-800',
  SUMMARIZING: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  CONVERTED: 'bg-purple-100 text-purple-800',
};

const areaColors: Record<string, string> = {
  DIGITALIZATION: 'bg-indigo-100 text-indigo-800',
  HEALTH: 'bg-red-100 text-red-800',
  EDUCATION: 'bg-amber-100 text-amber-800',
  TRANSPORT: 'bg-cyan-100 text-cyan-800',
  ENVIRONMENT: 'bg-emerald-100 text-emerald-800',
  TAXES: 'bg-orange-100 text-orange-800',
  SECURITY: 'bg-slate-100 text-slate-800',
  SOCIAL: 'bg-pink-100 text-pink-800',
  ECONOMY: 'bg-violet-100 text-violet-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const isOpen = idea.status === 'NEW' || idea.status === 'COLLECTING';
  const deadlinePassed =
    idea.opinionDeadline && new Date(idea.opinionDeadline) < new Date();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    if (!idea.opinionDeadline) return null;
    const deadline = new Date(idea.opinionDeadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  areaColors[idea.area] || areaColors.OTHER
                }`}
              >
                {IDEA_AREA_LABELS[idea.area]}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  statusColors[idea.status] || statusColors.CLOSED
                }`}
              >
                {isOpen && !deadlinePassed && '🟢 '}
                {idea.status === 'SUMMARIZING' && '🟡 '}
                {IDEA_STATUS_LABELS[idea.status]}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {IDEA_STAGE_LABELS[idea.stage]}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
              {idea.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {idea.shortDescription}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{idea.ministry}</span>
              </div>

              {idea.opinionDeadline && (
                <div
                  className={`flex items-center gap-1.5 ${
                    deadlinePassed
                      ? 'text-gray-400'
                      : daysRemaining && daysRemaining <= 7
                      ? 'text-red-600 font-medium'
                      : ''
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    {deadlinePassed
                      ? 'Zakończone'
                      : `Do ${formatDate(idea.opinionDeadline)}`}
                    {!deadlinePassed &&
                      daysRemaining &&
                      daysRemaining <= 7 &&
                      ` (${daysRemaining} dni)`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{idea.totalSurveys || 0} głosów</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{idea.totalOpinions || 0} opinii</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center">
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
