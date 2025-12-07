'use client';

import { use } from 'react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { useLaw, usePhase } from '@/features/laws/hooks/useLaws';
import { StageCard } from '@/features/laws/components/StageCard';
import { PhaseBadge } from '@/components/ui/Badge';
import {
  IDEA_AREA_LABELS,
  RESPONDENT_TYPE_LABELS,
  RespondentType,
} from '@/lib/api/types';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Users,
  Lightbulb,
  AlertTriangle,
  Star,
  FileText,
  Download,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

export default function PhasePage({
  params,
}: {
  params: Promise<{ lawId: string; phaseId: string }>;
}) {
  const { lawId, phaseId } = use(params);
  const { data: law } = useLaw(lawId);
  const { data: phase, isLoading, error } = usePhase(lawId, phaseId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (error || !phase) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Nie znaleziono fazy</p>
        <Link
          href={`/laws/${lawId}`}
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Wróć do ustawy
        </Link>
      </div>
    );
  }

  // Specjalny widok dla PRECONSULTATION
  if (phase.type === 'PRECONSULTATION' && phase.idea) {
    const idea = phase.idea;

    // Oblicz statystyki
    const totalSurveys = idea.surveyResponses?.length || 0;
    const totalOpinions = idea.opinions?.length || 0;

    let supportFor = 0;
    let supportAgainst = 0;
    let avgImportance = 0;

    if (totalSurveys > 0) {
      const forVotes = idea.surveyResponses.filter((r: any) => r.support >= 3).length;
      supportFor = Math.round((forVotes / totalSurveys) * 100);
      supportAgainst = 100 - supportFor;
      avgImportance = idea.surveyResponses.reduce((sum: number, r: any) => sum + r.importance, 0) / totalSurveys;
    }

    // Opinie według typu
    const opinionsByType: Record<string, number> = {
      CITIZEN: 0,
      NGO: 0,
      COMPANY: 0,
      EXPERT: 0,
    };
    idea.opinions?.forEach((op: any) => {
      if (opinionsByType[op.respondentType] !== undefined) {
        opinionsByType[op.respondentType]++;
      }
    });

    return (
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Link
          href={`/laws/${lawId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć do {law?.name || 'ustawy'}
        </Link>

        {/* Nagłówek fazy */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-xl">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          </div>

          <div className="relative px-8 py-10 sm:px-12">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <PhaseBadge phase={phase.type} />
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                {IDEA_AREA_LABELS[idea.area as keyof typeof IDEA_AREA_LABELS]}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              {idea.title}
            </h1>

            <p className="text-lg text-orange-100/90 mb-6 max-w-3xl">
              {idea.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{idea.ministry}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Prekonsultacje: {formatDate(idea.publishDate)} - {phase.endDate ? formatDate(phase.endDate) : 'obecnie'}</span>
              </div>
            </div>

            {/* Link do oryginalnego pomysłu */}
            <div className="mt-6">
              <Link
                href={`/ideas/${idea.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Zobacz pełną stronę prekonsultacji
              </Link>
            </div>
          </div>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-blue-600">{totalSurveys}</div>
            <div className="text-sm text-gray-600">głosów w ankiecie</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalOpinions}</div>
            <div className="text-sm text-gray-600">szczegółowych opinii</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-3xl font-bold text-green-600">{supportFor}%</div>
            <div className="text-sm text-gray-600">poparcia</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i <= Math.round(avgImportance)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-1">średnia ważność ({avgImportance.toFixed(1)}/5)</div>
          </div>
        </div>

        {/* Problem i Rozwiązania */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Problem</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {idea.problemDescription}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Rozważane rozwiązania</h2>
            </div>
            {Array.isArray(idea.proposedSolutions) && idea.proposedSolutions.length > 0 ? (
              <ul className="space-y-3">
                {idea.proposedSolutions.map((solution: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{solution}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">Brak zdefiniowanych kierunków rozwiązań</p>
            )}
          </div>
        </div>

        {/* Opinie według typu */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Opinie według typu respondenta</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(opinionsByType).map(([type, count]) => (
              <div key={type} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">
                  {RESPONDENT_TYPE_LABELS[type as RespondentType]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        {idea.aiSummary && idea.aiSummaryPublic && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-purple-900">Podsumowanie AI</h2>
            </div>
            <div className="prose prose-sm prose-purple max-w-none text-purple-800">
              <Markdown>{idea.aiSummary}</Markdown>
            </div>
            {idea.aiSummaryDate && (
              <p className="text-xs text-purple-500 mt-4">
                Wygenerowano: {formatDate(idea.aiSummaryDate)}
              </p>
            )}
          </div>
        )}

        {/* Załączniki */}
        {idea.attachments && idea.attachments.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Dokumenty</h2>
            </div>

            <div className="space-y-3">
              {idea.attachments.map((attachment: any) => (
                <a
                  key={attachment.id}
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ideas/${idea.id}/attachments/${attachment.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {attachment.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Download className="w-5 h-5" />
                    <span className="text-sm font-medium">Pobierz</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        {idea.timeline && idea.timeline.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Przebieg prekonsultacji</h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

              <div className="space-y-6">
                {idea.timeline.map((event: any, index: number) => (
                  <div key={event.id} className="relative flex gap-4">
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                        index === idea.timeline.length - 1
                          ? 'bg-amber-500 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-500'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="text-sm text-gray-500 mb-1">
                        {formatDate(event.date)}
                      </div>
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standardowy widok dla innych faz
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link
        href={`/laws/${lawId}`}
        className="inline-flex items-center text-gray-600 hover:text-primary-700 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Wróć do {law?.name || 'ustawy'}
      </Link>

      {/* Phase info */}
      <div className="relative">
        <div className="absolute -top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/40 to-primary-200/20 rounded-full blur-3xl -z-10" />
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200/60">
          <div className="flex items-center space-x-3 mb-4">
            <PhaseBadge phase={phase.type} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {law?.name || 'Ustawa'}
          </h1>
          <div className="flex items-center text-sm text-gray-500 bg-white/60 rounded-lg px-4 py-2 inline-flex">
            <Calendar className="w-4 h-4 mr-2 text-primary-600" />
            {new Date(phase.startDate).toLocaleDateString('pl-PL')}
            {phase.endDate &&
              ` - ${new Date(phase.endDate).toLocaleDateString('pl-PL')}`}
          </div>
        </div>
      </div>

      {/* Stages */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-8 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full mr-3"></span>
          Etapy
        </h2>

        {phase.stages.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <p className="text-gray-600">Brak etapów w tej fazie</p>
          </div>
        ) : (
          <div className="space-y-4">
            {phase.stages.map((stage, index) => (
              <div
                key={stage.id}
                id={`stage-${stage.id}`}
                className="animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StageCard
                  stage={stage}
                  lawId={lawId}
                  phaseId={phaseId}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
