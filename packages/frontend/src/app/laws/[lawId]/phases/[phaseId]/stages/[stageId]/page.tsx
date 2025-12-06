'use client';

import { use, useState, useMemo } from 'react';
import { useLaw, usePhase, useStage, useAnalyze, useAllStages, useDiff } from '@/features/laws/hooks/useLaws';
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
} from 'lucide-react';
import Link from 'next/link';
import { FILE_TYPE_LABELS, PHASE_LABELS } from '@/lib/api/types';

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
  const analyze = useAnalyze();
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    changes: string[];
    effects: string[];
    simplifiedExplanation: string;
  } | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  // Find the previous stage with lawTextContent
  const previousStageWithText = useMemo(() => {
    if (!allStagesData?.stages || !stage) return null;

    // Get all stages with text content, sorted by order
    const stagesWithText = allStagesData.stages
      .filter(s => s.lawTextContent && s.id !== stageId)
      .sort((a, b) => a.order - b.order);

    // Find the current stage's order
    const currentStage = allStagesData.stages.find(s => s.id === stageId);
    if (!currentStage) return null;

    // Find the most recent stage before current that has text
    const previousStages = stagesWithText.filter(s => s.order < currentStage.order);
    return previousStages.length > 0 ? previousStages[previousStages.length - 1] : null;
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
            <p className="text-gray-600 mb-4">{stage.description}</p>
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
          </div>
        </CardContent>
      </Card>

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

      {/* Law text content */}
      {stage.lawTextContent && (
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
