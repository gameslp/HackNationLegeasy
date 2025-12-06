'use client';

import { use, useState } from 'react';
import { useLaw, useAllStages, useDiff } from '@/features/laws/hooks/useLaws';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { ArrowLeft, GitCompare, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { PHASE_LABELS } from '@/lib/api/types';

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

  const { data: diffResult, isLoading: loadingDiff } = useDiff(
    lawId,
    sourceStageId,
    targetStageId
  );

  const stageOptions = [
    { value: '', label: 'Wybierz etap...' },
    ...(stagesData?.stages.map((s) => ({
      value: s.id,
      label: `${s.phaseType ? PHASE_LABELS[s.phaseType] + ': ' : ''}${s.name}`,
    })) || []),
  ];

  const renderDiff = (diffText: string) => {
    const lines = diffText.split('\n');
    return lines.map((line, index) => {
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
              onChange={(e) => setSourceStageId(e.target.value)}
              disabled={loadingStages}
            />
            <Select
              label="Wersja docelowa (nowsza)"
              options={stageOptions}
              value={targetStageId}
              onChange={(e) => setTargetStageId(e.target.value)}
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
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
              </CardHeader>
              <CardContent>
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
