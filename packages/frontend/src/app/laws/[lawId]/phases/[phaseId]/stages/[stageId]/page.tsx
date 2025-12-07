'use client';

import { use, useState, useMemo } from 'react';
import { useLaw, usePhase, useStage, useAnalyze, useAllStages, useDiff } from '@/features/laws/hooks/useLaws';
import { useStageImpact } from '@/features/laws/hooks/useImpact';
import { DiscussionSection } from '@/features/laws/components/DiscussionSection';
import { PhaseBadge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  Loader2,
  GitCompare,
  Plus,
  Minus,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Star,
  Lightbulb,
  Building2,
  Radar,
} from 'lucide-react';
import { ImpactRadarChart, OverallScoreDisplay, ScoreBadge } from '@/components/ui/ImpactRadarChart';
import { PDFViewer } from '@/components/ui/PDFViewer';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { FILE_TYPE_LABELS, PHASE_LABELS, IDEA_AREA_LABELS, RESPONDENT_TYPE_LABELS, SUPPORT_LABELS, IdeaArea, RespondentType } from '@/lib/api/types';

export default function StagePage({
  params,
}: {
  params: Promise<{ lawId: string; phaseId: string; stageId: string }>;
}) {
  const { lawId, phaseId, stageId } = use(params);
  const { data: law } = useLaw(lawId);
  const { data: phase } = usePhase(lawId, phaseId);
  const { data: stage, isLoading, error } = useStage(lawId, phaseId, stageId);
  const { data: allStagesData } = useAllStages(lawId);
  const { data: impactData } = useStageImpact(stageId);
  const analyze = useAnalyze();
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    changes: string[];
    effects: string[];
    simplifiedExplanation: string;
  } | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  // Find the previous stage with lawTextContent across ALL phases
  const previousStageWithText = useMemo(() => {
    if (!allStagesData?.stages || !stage) return null;

    // Find the current stage's index in the sorted list
    // Backend returns stages sorted by phaseOrder, then by stage order
    const currentIndex = allStagesData.stages.findIndex(s => s.id === stageId);
    if (currentIndex === -1) return null;

    // Look backwards from current stage to find the most recent with lawTextContent
    for (let i = currentIndex - 1; i >= 0; i--) {
      const s = allStagesData.stages[i];
      if (s.lawTextContent) {
        return s;
      }
    }

    return null;
  }, [allStagesData, stage, stageId]);

  // Fetch diff when showDiff is true
  const { data: diffResult, isLoading: loadingDiff } = useDiff(
    lawId,
    showDiff && previousStageWithText ? previousStageWithText.id : '',
    showDiff ? stageId : ''
  );

  const handleAnalyze = async (fileId?: string) => {
    const result = await analyze.mutateAsync({
      lawId,
      phaseId,
      stageId,
      fileId,
    });
    setAnalysisResult(result);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (error || !stage) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Nie znaleziono etapu</p>
        <Link
          href={`/laws/${lawId}/phases/${phaseId}`}
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Wróć do fazy
        </Link>
      </div>
    );
  }

  const governmentLinks: string[] =
    typeof stage.governmentLinks === 'string'
      ? JSON.parse(stage.governmentLinks)
      : stage.governmentLinks || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/laws/${lawId}/phases/${phaseId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do fazy
      </Link>

      {/* Stage header */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center space-x-3 mb-2">
            {phase && <PhaseBadge phase={phase.type} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{stage.name}</h1>
          <p className="text-sm text-gray-500 mb-4">{law?.name}</p>

          {stage.description && (
            <div className="prose prose-sm max-w-none text-gray-600 mb-4">
              <Markdown>{stage.description}</Markdown>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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

          {/* Government links */}
          {governmentLinks.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Linki do stron rządowych:
              </h4>
              <div className="flex flex-wrap gap-2">
                {governmentLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-primary-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Link {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => handleAnalyze()}
              disabled={analyze.isPending}
            >
              {analyze.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Analizuj AI
            </Button>

            {/* Show changes button - only if current stage has text and there's a previous stage with text */}
            {stage.lawTextContent && previousStageWithText && (
              <Button
                variant={showDiff ? 'primary' : 'secondary'}
                onClick={() => setShowDiff(!showDiff)}
              >
                <GitCompare className="w-4 h-4 mr-2" />
                {showDiff ? 'Ukryj zmiany' : 'Pokaż zmiany'}
              </Button>
            )}

            {/* Impact Radar link - only if analysis exists and is published */}
            {impactData?.analysis && (
              <Link href={`/laws/${lawId}/impact`}>
                <Button variant="primary">
                  <Radar className="w-4 h-4 mr-2" />
                  Radar Wpływu
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact Analysis Summary - if published */}
      {impactData?.analysis && (
        <Card className="border-primary-200 bg-gradient-to-br from-primary-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Radar className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Analiza Wpływu</h3>
              </div>
              <Link href={`/laws/${lawId}/impact`}>
                <Button variant="secondary" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Pełna analiza
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left - Radar Chart */}
              <div className="flex items-center justify-center">
                <ImpactRadarChart analysis={impactData.analysis} height={250} />
              </div>

              {/* Right - Summary */}
              <div className="space-y-4">
                <OverallScoreDisplay
                  score={impactData.analysis.overallScore}
                  mainAffectedGroup={impactData.analysis.mainAffectedGroup}
                  uncertaintyLevel={impactData.analysis.uncertaintyLevel}
                />

                {/* Simple Summary */}
                {impactData.analysis.simpleSummary.length > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Co to zmienia?</h4>
                    <ul className="space-y-1">
                      {impactData.analysis.simpleSummary.slice(0, 3).map((item: string, i: number) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start">
                          <span className="text-primary-500 mr-2 font-bold">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PRECONSULTATION - Specjalny widok danych z pomysłu */}
      {phase?.type === 'PRECONSULTATION' && stage.idea && (
        <div className="space-y-6">
          {/* Statystyki prekonsultacji */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Wyniki prekonsultacji</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Statystyka: Głosy */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Głosy w ankiecie</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stage.idea.surveyResponses?.length || 0}</p>
                </div>

                {/* Statystyka: Opinie */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Szczegółowe opinie</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{stage.idea.opinions?.length || 0}</p>
                </div>

                {/* Statystyka: Poparcie */}
                {stage.idea.surveyResponses && stage.idea.surveyResponses.length > 0 && (() => {
                  const forVotes = stage.idea.surveyResponses.filter((r: { support: number }) => r.support >= 3).length;
                  const total = stage.idea.surveyResponses.length;
                  const supportPercent = Math.round((forVotes / total) * 100);
                  return (
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ThumbsUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Poparcie</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{supportPercent}%</p>
                    </div>
                  );
                })()}

                {/* Statystyka: Ważność */}
                {stage.idea.surveyResponses && stage.idea.surveyResponses.length > 0 && (() => {
                  const avgImportance = stage.idea.surveyResponses.reduce((sum: number, r: { importance: number }) => sum + r.importance, 0) / stage.idea.surveyResponses.length;
                  return (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Śr. ważność</span>
                      </div>
                      <div className="flex items-center gap-1">
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
                    </div>
                  );
                })()}
              </div>

              {/* Informacje o pomyśle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Ministerstwo</span>
                  </div>
                  <p className="text-gray-900">{stage.idea.ministry}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Obszar</span>
                  </div>
                  <p className="text-gray-900">{IDEA_AREA_LABELS[stage.idea.area as IdeaArea]}</p>
                </div>
              </div>

              {/* Problem i rozwiązania */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Problem</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{stage.idea.problemDescription}</p>
                </div>

                {stage.idea.proposedSolutions && (stage.idea.proposedSolutions as string[]).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Proponowane kierunki rozwiązań</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                      {(stage.idea.proposedSolutions as string[]).map((solution, i) => (
                        <li key={i}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opinie według typu respondenta */}
          {stage.idea.opinions && stage.idea.opinions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold">Opinie według typu respondenta</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(
                    (stage.idea.opinions as Array<{ respondentType: string }>).reduce((acc: Record<string, number>, op) => {
                      acc[op.respondentType] = (acc[op.respondentType] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([type, count]) => (
                    <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                      <p className="text-sm text-gray-600">{RESPONDENT_TYPE_LABELS[type as RespondentType]}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline z pomysłu */}
          {stage.idea.timeline && stage.idea.timeline.length > 0 && (() => {
            const timeline = stage.idea!.timeline!;
            return (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold">Przebieg prekonsultacji</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {timeline.map((event, index) => (
                      <div key={event.id} className="relative flex gap-4">
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            index === timeline.length - 1
                              ? 'bg-amber-500 text-white'
                              : 'bg-white border-2 border-gray-300 text-gray-500'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString('pl-PL')}
                          </p>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })()}

          {/* Link do oryginalnego pomysłu */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-900">Oryginalny pomysł</p>
                  <p className="text-sm text-amber-700">{stage.idea.title}</p>
                </div>
              </div>
              <Link
                href={`/ideas/${stage.idea.id}`}
                className="text-amber-700 hover:text-amber-900 font-medium text-sm hover:underline"
              >
                Zobacz szczegóły &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Diff with previous stage */}
      {showDiff && previousStageWithText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitCompare className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Zmiany od poprzedniej wersji</h3>
              </div>
              {diffResult && (
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center text-green-600">
                    <Plus className="w-4 h-4 mr-1" />
                    {diffResult.additions} dodanych
                  </span>
                  <span className="flex items-center text-red-600">
                    <Minus className="w-4 h-4 mr-1" />
                    {diffResult.deletions} usuniętych
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Porównanie z etapem:{' '}
                <Link
                  href={`/laws/${lawId}/phases/${previousStageWithText.phaseId}/stages/${previousStageWithText.id}`}
                  className="font-medium text-primary-600 hover:underline"
                >
                  {previousStageWithText.phaseType ? `${PHASE_LABELS[previousStageWithText.phaseType]}: ` : ''}
                  {previousStageWithText.name}
                </Link>
              </p>
            </div>

            {loadingDiff ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
                <p className="mt-2 text-gray-600">Generowanie porównania...</p>
              </div>
            ) : diffResult?.diff ? (
              <div className="bg-gray-50 rounded-lg overflow-x-auto p-4">
                {diffResult.diff.split('\n').map((line, index) => {
                  let className = 'font-mono text-sm';
                  let icon = null;

                  if (line.startsWith('+') && !line.startsWith('+++')) {
                    className += ' bg-green-50 text-green-800';
                    icon = <Plus className="w-4 h-4 text-green-600 inline mr-2" />;
                  } else if (line.startsWith('-') && !line.startsWith('---')) {
                    className += ' bg-red-50 text-red-800';
                    icon = <Minus className="w-4 h-4 text-red-600 inline mr-2" />;
                  } else if (line.startsWith('@@')) {
                    className += ' bg-blue-50 text-blue-800';
                  } else {
                    className += ' text-gray-600';
                  }

                  return (
                    <div key={index} className={`${className} px-2 py-0.5`}>
                      {icon}
                      {line}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Brak różnic między wersjami
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Analiza AI</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Podsumowanie</h4>
              <p className="text-gray-600">{analysisResult.summary}</p>
            </div>

            {analysisResult.changes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Główne zmiany</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {analysisResult.changes.map((change, i) => (
                    <li key={i}>{change}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.effects.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Potencjalne efekty
                </h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {analysisResult.effects.map((effect, i) => (
                    <li key={i}>{effect}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-primary-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">
                Wyjaśnienie prostym językiem
              </h4>
              <p className="text-gray-600">
                {analysisResult.simplifiedExplanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      {stage.files && stage.files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Pliki</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stage.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {FILE_TYPE_LABELS[file.fileType]} •{' '}
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/laws/${lawId}/phases/${phaseId}/stages/${stageId}/files/${file.id}`}
                    download
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Viewer for law PDF */}
      {stage.lawPdfPath && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold">Treść ustawy (PDF)</h3>
            </div>
          </CardHeader>
          <CardContent>
            <PDFViewer
              url={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/laws/${lawId}/phases/${phaseId}/stages/${stageId}/law-pdf`}
              title="Ustawa"
            />
          </CardContent>
        </Card>
      )}

      {/* Law text content - shown as fallback when no PDF */}
      {stage.lawTextContent && !stage.lawPdfPath && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Treść ustawy</h3>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg overflow-x-auto">
              {stage.lawTextContent}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Discussion */}
      <DiscussionSection
        discussions={stage.discussions || []}
        lawId={lawId}
        phaseId={phaseId}
        stageId={stageId}
      />
    </div>
  );
}
