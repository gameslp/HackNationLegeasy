'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useLaw } from '@/features/laws/hooks/useLaws';
import { useLawImpact, useCompareImpact } from '@/features/laws/hooks/useImpact';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ImpactRadarChart,
  OverallScoreDisplay,
  ScoreBadge,
} from '@/components/ui/ImpactRadarChart';
import {
  ArrowLeft,
  Radar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Users,
  Building,
  Briefcase,
  Leaf,
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  IMPACT_CATEGORY_LABELS,
  ImpactAnalysis,
  ImpactCategoryDetails,
  StageWithImpact,
  PHASE_LABELS,
  PhaseType,
} from '@/lib/api/types';

export default function ImpactRadarPage({
  params,
}: {
  params: Promise<{ lawId: string }>;
}) {
  const { lawId } = use(params);
  const { data: law, isLoading: lawLoading } = useLaw(lawId);
  const { data: impactData, isLoading: impactLoading } = useLawImpact(lawId);

  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonStageIndex, setComparisonStageIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  if (lawLoading || impactLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Wczytywanie analizy...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!impactData || impactData.analyses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/laws/${lawId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć do ustawy
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <Radar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 mb-2">
                Brak analizy wpływu
              </h2>
              <p className="text-gray-500">
                Analiza wpływu dla tej ustawy nie została jeszcze przygotowana.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const analyses = impactData.analyses;
  const selectedAnalysis = analyses[selectedStageIndex];
  const comparisonAnalysis = comparisonStageIndex !== null ? analyses[comparisonStageIndex] : undefined;

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economic':
        return <Briefcase className="w-5 h-5" />;
      case 'social':
        return <Users className="w-5 h-5" />;
      case 'administrative':
        return <Building className="w-5 h-5" />;
      case 'technological':
        return <Cpu className="w-5 h-5" />;
      case 'environmental':
        return <Leaf className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const renderCategoryDetails = (
    category: string,
    details: ImpactCategoryDetails | null,
    score: number
  ) => {
    const isExpanded = expandedCategories.has(category);

    return (
      <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleCategory(category)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="text-primary-600">{getCategoryIcon(category)}</div>
            <span className="font-medium text-gray-900">
              {IMPACT_CATEGORY_LABELS[category]}
            </span>
            <ScoreBadge score={score} label="Wpływ" size="sm" />
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isExpanded && details && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            {details.description && (
              <p className="text-gray-600">{details.description}</p>
            )}

            {details.benefits.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 flex items-center mb-2">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Korzyści
                </h4>
                <ul className="space-y-1">
                  {details.benefits.map((benefit, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2">+</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {details.costs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 flex items-center mb-2">
                  <XCircle className="w-4 h-4 mr-2" />
                  Koszty / Wyzwania
                </h4>
                <ul className="space-y-1">
                  {details.costs.map((cost, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start">
                      <span className="text-red-500 mr-2">-</span>
                      {cost}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {details.affectedGroups.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-blue-700 flex items-center mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  Dotknięte grupy
                </h4>
                <div className="flex flex-wrap gap-2">
                  {details.affectedGroups.map((group, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isExpanded && !details && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-4">
            <p className="text-gray-500 text-sm">Brak szczegółowych danych</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href={`/laws/${lawId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć do ustawy
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Radar className="w-6 h-6 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Radar Wpływu</h1>
          </div>
          <p className="text-gray-500 mt-1">{impactData.law.name}</p>
        </div>

        {/* Stage selector */}
        {analyses.length > 1 && (
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wybierz wersję
                  </label>
                  <select
                    value={selectedStageIndex}
                    onChange={(e) => setSelectedStageIndex(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {analyses.map((a: StageWithImpact, i: number) => (
                      <option key={a.stageId} value={i}>
                        {a.stageName} ({PHASE_LABELS[a.phaseType as PhaseType]})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compareMode}
                      onChange={(e) => {
                        setCompareMode(e.target.checked);
                        if (!e.target.checked) {
                          setComparisonStageIndex(null);
                        } else if (analyses.length > 1) {
                          setComparisonStageIndex(selectedStageIndex === 0 ? 1 : 0);
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Tryb porównania</span>
                  </label>
                </div>

                {compareMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porównaj z
                    </label>
                    <select
                      value={comparisonStageIndex ?? ''}
                      onChange={(e) => setComparisonStageIndex(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {analyses.map((a: StageWithImpact, i: number) => (
                        <option key={a.stageId} value={i} disabled={i === selectedStageIndex}>
                          {a.stageName} ({PHASE_LABELS[a.phaseType as PhaseType]})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">Wykres wpływu</h2>
              </CardHeader>
              <CardContent>
                <ImpactRadarChart
                  analysis={selectedAnalysis.analysis}
                  comparisonAnalysis={comparisonAnalysis?.analysis}
                  showLegend={compareMode}
                  height={400}
                />
              </CardContent>
            </Card>
          </div>

          {/* Overall Score */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold">Ogólna ocena</h2>
              </CardHeader>
              <CardContent>
                <OverallScoreDisplay
                  score={selectedAnalysis.analysis.overallScore}
                  mainAffectedGroup={selectedAnalysis.analysis.mainAffectedGroup}
                  uncertaintyLevel={selectedAnalysis.analysis.uncertaintyLevel}
                />
              </CardContent>
            </Card>

            {/* Simple Summary */}
            {selectedAnalysis.analysis.simpleSummary.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                    Co to zmienia?
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedAnalysis.analysis.simpleSummary.map((item: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start text-gray-700"
                      >
                        <span className="text-primary-500 mr-2 font-bold">{i + 1}.</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comparison diff */}
        {compareMode && comparisonAnalysis && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">Zmiany między wersjami</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { key: 'economicScore', label: 'Ekonomiczny' },
                  { key: 'socialScore', label: 'Społeczny' },
                  { key: 'administrativeScore', label: 'Administracyjny' },
                  { key: 'technologicalScore', label: 'Technologiczny' },
                  { key: 'environmentalScore', label: 'Środowiskowy' },
                ].map(({ key, label }) => {
                  const before = comparisonAnalysis.analysis[key as keyof ImpactAnalysis] as number;
                  const after = selectedAnalysis.analysis[key as keyof ImpactAnalysis] as number;
                  const change = after - before;

                  return (
                    <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{label}</p>
                      <div className="flex items-center justify-center space-x-1">
                        <span className="text-gray-400">{before}</span>
                        <span className="text-gray-300">→</span>
                        <span className="font-semibold">{after}</span>
                        {change !== 0 && (
                          <span
                            className={`text-sm ${
                              change > 0 ? 'text-red-500' : 'text-green-500'
                            }`}
                          >
                            {change > 0 ? (
                              <TrendingUp className="w-4 h-4 inline" />
                            ) : (
                              <TrendingDown className="w-4 h-4 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Details */}
        <Card className="mt-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Szczegóły kategorii</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {renderCategoryDetails(
                'economic',
                selectedAnalysis.analysis.economicDetails,
                selectedAnalysis.analysis.economicScore
              )}
              {renderCategoryDetails(
                'social',
                selectedAnalysis.analysis.socialDetails,
                selectedAnalysis.analysis.socialScore
              )}
              {renderCategoryDetails(
                'administrative',
                selectedAnalysis.analysis.administrativeDetails,
                selectedAnalysis.analysis.administrativeScore
              )}
              {renderCategoryDetails(
                'technological',
                selectedAnalysis.analysis.technologicalDetails,
                selectedAnalysis.analysis.technologicalScore
              )}
              {renderCategoryDetails(
                'environmental',
                selectedAnalysis.analysis.environmentalDetails,
                selectedAnalysis.analysis.environmentalScore
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stage info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Analiza wygenerowana:{' '}
            {new Date(selectedAnalysis.analysis.generatedAt).toLocaleDateString('pl-PL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {selectedAnalysis.analysis.editedByAdmin && ' (edytowana przez administratora)'}
          </p>
        </div>
      </div>
    </div>
  );
}
