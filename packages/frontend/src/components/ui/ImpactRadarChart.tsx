'use client';

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ImpactAnalysis, IMPACT_CATEGORY_LABELS } from '@/lib/api/types';

interface ImpactRadarChartProps {
  analysis: ImpactAnalysis;
  comparisonAnalysis?: ImpactAnalysis;
  showLegend?: boolean;
  height?: number;
}

interface ChartDataItem {
  category: string;
  fullName: string;
  current: number;
  comparison?: number;
}

export function ImpactRadarChart({
  analysis,
  comparisonAnalysis,
  showLegend = false,
  height = 400,
}: ImpactRadarChartProps) {
  const data: ChartDataItem[] = [
    {
      category: 'Ekon.',
      fullName: IMPACT_CATEGORY_LABELS.economic,
      current: analysis.economicScore,
      ...(comparisonAnalysis && { comparison: comparisonAnalysis.economicScore }),
    },
    {
      category: 'Społ.',
      fullName: IMPACT_CATEGORY_LABELS.social,
      current: analysis.socialScore,
      ...(comparisonAnalysis && { comparison: comparisonAnalysis.socialScore }),
    },
    {
      category: 'Admin.',
      fullName: IMPACT_CATEGORY_LABELS.administrative,
      current: analysis.administrativeScore,
      ...(comparisonAnalysis && { comparison: comparisonAnalysis.administrativeScore }),
    },
    {
      category: 'Tech.',
      fullName: IMPACT_CATEGORY_LABELS.technological,
      current: analysis.technologicalScore,
      ...(comparisonAnalysis && { comparison: comparisonAnalysis.technologicalScore }),
    },
    {
      category: 'Środ.',
      fullName: IMPACT_CATEGORY_LABELS.environmental,
      current: analysis.environmentalScore,
      ...(comparisonAnalysis && { comparison: comparisonAnalysis.environmentalScore }),
    },
  ];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem; value: number; name: string }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{item.fullName}</p>
          <p className="text-primary-600">
            Aktualny: <span className="font-bold">{item.current}/5</span>
          </p>
          {item.comparison !== undefined && (
            <p className="text-amber-600">
              Poprzedni: <span className="font-bold">{item.comparison}/5</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid gridType="polygon" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: '#374151', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tickCount={6}
          tick={{ fill: '#9CA3AF', fontSize: 10 }}
        />
        <Radar
          name="Aktualny wpływ"
          dataKey="current"
          stroke="#3B82F6"
          fill="#3B82F6"
          fillOpacity={0.4}
          strokeWidth={2}
        />
        {comparisonAnalysis && (
          <Radar
            name="Poprzednia wersja"
            dataKey="comparison"
            stroke="#F59E0B"
            fill="#F59E0B"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        )}
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Score Badge Component
interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, label, size = 'md' }: ScoreBadgeProps) {
  const getScoreColor = (s: number) => {
    if (s <= 2) return 'bg-green-100 text-green-800 border-green-300';
    if (s <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (s <= 4) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${getScoreColor(score)} ${sizeClasses[size]}`}
    >
      {label}: {score}/5
    </span>
  );
}

// Overall Score Display
interface OverallScoreProps {
  score: number;
  mainAffectedGroup?: string | null;
  uncertaintyLevel?: string | null;
}

export function OverallScoreDisplay({
  score,
  mainAffectedGroup,
  uncertaintyLevel,
}: OverallScoreProps) {
  const getScoreInfo = (s: number) => {
    if (s <= 2) return { label: 'Niski wpływ', color: 'text-green-600', bg: 'bg-green-50' };
    if (s <= 3) return { label: 'Umiarkowany wpływ', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (s <= 4) return { label: 'Znaczący wpływ', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Wysoki wpływ', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const info = getScoreInfo(score);

  return (
    <div className={`rounded-xl p-6 ${info.bg} border border-gray-200`}>
      <div className="text-center">
        <div className={`text-5xl font-bold ${info.color}`}>{score}</div>
        <div className="text-gray-500 text-sm mt-1">/ 5</div>
        <div className={`text-lg font-semibold mt-2 ${info.color}`}>{info.label}</div>
      </div>
      {(mainAffectedGroup || uncertaintyLevel) && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          {mainAffectedGroup && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Główna grupa:</span>
              <span className="font-medium text-gray-900">{mainAffectedGroup}</span>
            </div>
          )}
          {uncertaintyLevel && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pewność analizy:</span>
              <span className="font-medium text-gray-900 capitalize">{uncertaintyLevel}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
