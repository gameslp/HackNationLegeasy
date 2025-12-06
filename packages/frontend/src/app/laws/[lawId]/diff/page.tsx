'use client';

import { use, useState, useCallback } from 'react';
import { useLaw, useAllStages, useDiff, useAnalyzeDiff } from '@/features/laws/hooks/useLaws';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, GitCompare, Plus, Minus, Sparkles, Loader2, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import { PHASE_LABELS } from '@/lib/api/types';
import type { DiffAnalysisResult } from '@/lib/api/types';

export default function DiffPage({
  params,
}: {
  params: Promise<{ lawId: string }>;
}) {
  const { lawId } = use(params);
  const { data: law } = useLaw(lawId);
  const { data: stagesData, isLoading: loadingStages } = useAllStages(lawId);
  const [sourceStageId, setSourceStageId] = useState('');
  const [targetStageId, setTargetStageId] = useState('');
  const [selectedLines, setSelectedLines] = useState<Set<number>>(new Set());
  const [analysisResult, setAnalysisResult] = useState<DiffAnalysisResult | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { data: diffResult, isLoading: loadingDiff } = useDiff(
    lawId,
    sourceStageId,
    targetStageId
  );

  const analyzeDiff = useAnalyzeDiff();

  const sourceStage = stagesData?.stages.find(s => s.id === sourceStageId);
  const targetStage = stagesData?.stages.find(s => s.id === targetStageId);

  const stageOptions = [
    { value: '', label: 'Wybierz etap...' },
    ...(stagesData?.stages.map((s) => ({
      value: s.id,
      label: `${s.phaseType ? PHASE_LABELS[s.phaseType] + ': ' : ''}${s.name}${s.lawPdfPath ? ' (PDF)' : ''}`,
    })) || []),
  ];

  const toggleLineSelection = useCallback((index: number) => {
    if (!isSelectionMode) return;
    setSelectedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, [isSelectionMode]);

  const clearSelection = useCallback(() => {
    setSelectedLines(new Set());
  }, []);

  const handleAnalyzeFullDiff = async () => {
    if (!diffResult?.diff) return;

    const sourceName = sourceStage
      ? `${sourceStage.phaseType ? PHASE_LABELS[sourceStage.phaseType] + ': ' : ''}${sourceStage.name}`
      : 'Wersja źródłowa';
    const targetName = targetStage
      ? `${targetStage.phaseType ? PHASE_LABELS[targetStage.phaseType] + ': ' : ''}${targetStage.name}`
      : 'Wersja docelowa';

    const result = await analyzeDiff.mutateAsync({
      lawId,
      diffContent: diffResult.diff,
      sourceStage: sourceName,
      targetStage: targetName,
    });
    setAnalysisResult(result);
  };

  const handleAnalyzeSelection = async () => {
    if (!diffResult?.diff || selectedLines.size === 0) return;

    const lines = diffResult.diff.split('\n');
    const selectedContent = Array.from(selectedLines)
      .sort((a, b) => a - b)
      .map(index => lines[index])
      .join('\n');

    const sourceName = sourceStage
      ? `${sourceStage.phaseType ? PHASE_LABELS[sourceStage.phaseType] + ': ' : ''}${sourceStage.name}`
      : 'Wersja źródłowa';
    const targetName = targetStage
      ? `${targetStage.phaseType ? PHASE_LABELS[targetStage.phaseType] + ': ' : ''}${targetStage.name}`
      : 'Wersja docelowa';

    const result = await analyzeDiff.mutateAsync({
      lawId,
      diffContent: selectedContent,
      sourceStage: sourceName,
      targetStage: targetName,
    });
    setAnalysisResult(result);
  };

  const renderDiff = (diffText: string) => {
    const lines = diffText.split('\n');
    return lines.map((line, index) => {
      let className = 'font-mono text-sm';
      let icon = null;
      const isSelected = selectedLines.has(index);

      if (line.startsWith('+') && !line.startsWith('+++')) {
        className += ' bg-green-50 text-green-800';
        icon = <Plus className="w-4 h-4 text-green-600 inline mr-2 flex-shrink-0" />;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        className += ' bg-red-50 text-red-800';
        icon = <Minus className="w-4 h-4 text-red-600 inline mr-2 flex-shrink-0" />;
      } else if (line.startsWith('@@')) {
        className += ' bg-blue-50 text-blue-800';
      } else {
        className += ' text-gray-600';
      }

      if (isSelectionMode) {
        className += ' cursor-pointer hover:ring-2 hover:ring-primary-400';
        if (isSelected) {
          className += ' ring-2 ring-primary-600 bg-primary-50';
        }
      }

      return (
        <div
          key={index}
          className={`${className} px-2 py-0.5 flex items-start`}
          onClick={() => toggleLineSelection(index)}
        >
          {isSelectionMode && (
            <span className="mr-2 flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </span>
          )}
          {icon}
          <span className="whitespace-pre-wrap break-all">{line}</span>
        </div>
      );
    });
  };

  return (
    <div>
      {/* Back button */}
      <Link
        href={`/laws/${lawId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do ustawy
      </Link>

      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <GitCompare className="w-6 h-6 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Porównanie wersji</h1>
        </div>
        <p className="text-gray-600">{law?.name}</p>
      </div>

      {/* Stage selectors */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Wersja źródłowa (starsza)"
              options={stageOptions}
              value={sourceStageId}
              onChange={(e) => {
                setSourceStageId(e.target.value);
                setAnalysisResult(null);
                clearSelection();
              }}
              disabled={loadingStages}
            />
            <Select
              label="Wersja docelowa (nowsza)"
              options={stageOptions}
              value={targetStageId}
              onChange={(e) => {
                setTargetStageId(e.target.value);
                setAnalysisResult(null);
                clearSelection();
              }}
              disabled={loadingStages}
            />
          </div>
        </CardContent>
      </Card>

      {/* Diff result */}
      {sourceStageId && targetStageId && (
        <>
          {loadingDiff ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generowanie porównania...</p>
            </div>
          ) : diffResult ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold">Różnice</h3>
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
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {diffResult.diff && (
                        <>
                          <Button
                            variant={isSelectionMode ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => {
                              setIsSelectionMode(!isSelectionMode);
                              if (isSelectionMode) clearSelection();
                            }}
                          >
                            <CheckSquare className="w-4 h-4 mr-2" />
                            {isSelectionMode ? 'Zakończ wybór' : 'Wybierz fragment'}
                          </Button>
                          {isSelectionMode && selectedLines.size > 0 && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleAnalyzeSelection}
                              disabled={analyzeDiff.isPending}
                            >
                              {analyzeDiff.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                              )}
                              Analizuj zaznaczenie ({selectedLines.size})
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleAnalyzeFullDiff}
                            disabled={analyzeDiff.isPending}
                          >
                            {analyzeDiff.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Analiza AI
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isSelectionMode && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      Kliknij na linie, które chcesz przeanalizować, następnie kliknij &quot;Analizuj zaznaczenie&quot;
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg overflow-x-auto p-4">
                    {diffResult.diff ? (
                      renderDiff(diffResult.diff)
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Brak różnic między wersjami
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

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
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Co się zmieniło?</h4>
                      <p className="text-gray-700">{analysisResult.explanation}</p>
                    </div>

                    {analysisResult.keyChanges.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Najważniejsze zmiany:</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {analysisResult.keyChanges.map((change, i) => (
                            <li key={i}>{change}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Jak to wpływa na obywateli?</h4>
                      <p className="text-gray-700">{analysisResult.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </>
      )}

      {!sourceStageId || !targetStageId ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <GitCompare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            Wybierz dwa etapy, aby porównać zmiany w treści ustawy
          </p>
        </div>
      ) : null}
    </div>
  );
}
