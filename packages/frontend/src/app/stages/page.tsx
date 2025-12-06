'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAllStages } from '@/features/admin/hooks/useAdmin';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { PhaseBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { PHASE_LABELS, type PhaseType, type StageListItem } from '@/lib/api/types';
import { ArrowRight, Calendar, FileText, Layers, MessageSquare, Search as SearchIcon } from 'lucide-react';

const phaseTypeOptions = [
  { value: '', label: 'Wszystkie fazy' },
  ...Object.entries(PHASE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function StagesPage() {
  const { data, isLoading } = useAllStages();
  const [search, setSearch] = useState('');
  const [phaseType, setPhaseType] = useState('');

  const stages = (data?.stages as StageListItem[] | undefined) ?? [];

  const filteredStages = useMemo(() => {
    return stages.filter((stage) => {
      const matchesSearch =
        stage.name.toLowerCase().includes(search.toLowerCase()) ||
        stage.phase.law.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = phaseType
        ? stage.phase.type === (phaseType as PhaseType)
        : true;
      return matchesSearch && matchesType;
    });
  }, [stages, search, phaseType]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-primary-50/60 to-white border border-primary-100 shadow-lg p-8">
        <div className="absolute -top-16 right-10 w-60 h-60 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-4 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded-full">
              <Layers className="w-4 h-4" />
              Etapy legislacyjne
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              Lista wszystkich etapów
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Szybki podgląd etapów w całym procesie wraz z przypisanymi fazami, plikami i komentarzami.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Łącznie etapów</p>
            <p className="text-4xl font-bold text-primary-700">{data?.total ?? stages.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Szukaj etapu lub ustawy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select
            value={phaseType}
            onChange={(e) => setPhaseType(e.target.value)}
            options={phaseTypeOptions}
          />
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : filteredStages.length === 0 ? (
        <EmptyState
          icon="search"
          title="Brak etapów do wyświetlenia"
          description="Zmień filtry lub dodaj nowe etapy w panelu administracyjnym."
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStages.map((stage) => (
            <Card key={stage.id} className="overflow-hidden">
              <CardHeader className="flex items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <PhaseBadge phase={stage.phase.type} />
                  <span className="text-sm text-gray-500 font-medium">
                    {stage.phase.law.name}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span>{new Date(stage.date).toLocaleDateString('pl-PL')}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stage.name}
                    </h3>
                    {stage.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {stage.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4 text-primary-600" />
                      <span>{stage._count.files}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-primary-600" />
                      <span>{stage._count.discussions}</span>
                    </div>
                  </div>
                </div>
                {stage.author && (
                  <p className="text-sm text-gray-500">
                    Autor / prowadzący: <span className="font-medium text-gray-700">{stage.author}</span>
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-gray-50/80">
                <div className="text-sm text-gray-500">
                  Faza: <span className="font-medium text-gray-700">{PHASE_LABELS[stage.phase.type]}</span>
                </div>
                <Link
                  href={`/laws/${stage.phase.law.id}/phases/${stage.phase.id}#stage-${stage.id}`}
                  className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800"
                >
                  Przejdź do etapu
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
