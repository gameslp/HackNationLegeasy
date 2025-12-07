'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAllPhases } from '@/features/admin/hooks/useAdmin';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { PhaseBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { PHASE_LABELS, type PhaseListItem, type PhaseType } from '@/lib/api/types';
import { ArrowRight, Calendar, GitBranch, Layers, Search as SearchIcon } from 'lucide-react';

const phaseTypeOptions = [
  { value: '', label: 'Wszystkie fazy' },
  ...Object.entries(PHASE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function PhasesPage() {
  const { data, isLoading } = useAllPhases();
  const [search, setSearch] = useState('');
  const [phaseType, setPhaseType] = useState('');

  const phases = (data?.phases as PhaseListItem[] | undefined) ?? [];

  const filteredPhases = useMemo(() => {
    return phases.filter((phase) => {
      const matchesSearch =
        phase.law.name.toLowerCase().includes(search.toLowerCase()) ||
        phase.law.author.toLowerCase().includes(search.toLowerCase());
      const matchesType = phaseType ? phase.type === (phaseType as PhaseType) : true;
      return matchesSearch && matchesType;
    });
  }, [phases, search, phaseType]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-primary-50/60 to-white border border-primary-100 shadow-lg p-8">
        <div className="absolute -top-20 -right-10 w-64 h-64 bg-primary-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 left-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 bg-primary-100 px-3 py-1 rounded-full">
              <Layers className="w-4 h-4" />
              Fazy legislacyjne
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-3">
              Wszystkie fazy w jednym miejscu
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Przeglądaj fazy procesu legislacyjnego wraz z powiązanymi ustawami i liczbą etapów.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Łącznie faz</p>
            <p className="text-4xl font-bold text-primary-700">{data?.total ?? phases.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
          <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Szukaj po nazwie ustawy lub autorze..."
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
      ) : filteredPhases.length === 0 ? (
        <EmptyState
          icon="search"
          title="Brak faz do wyświetlenia"
          description="Spróbuj zmienić filtry lub dodaj nowe fazy w panelu administracyjnym."
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPhases.map((phase) => (
            <Card key={phase.id} className="overflow-hidden">
              <CardHeader className="flex items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <PhaseBadge phase={phase.type} />
                  <span className="text-sm text-gray-500 font-medium">
                    Kolejność: {phase.order}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    Etapów: {phase._count.stages}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <GitBranch className="w-4 h-4 text-primary-600" />
                  <span>{phase.law.author}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Link
                    href={`/laws/${phase.law.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-700 transition-colors"
                  >
                    {phase.law.name}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">Autor: {phase.law.author}</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-primary-600" />
                  <span>
                    {new Date(phase.startDate).toLocaleDateString('pl-PL')}
                    {phase.endDate &&
                      ` — ${new Date(phase.endDate).toLocaleDateString('pl-PL')}`}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between bg-gray-50/80">
                <div className="text-sm text-gray-500">
                  Utworzono: {new Date(phase.createdAt).toLocaleDateString('pl-PL')}
                </div>
                <Link
                  href={`/laws/${phase.law.id}/phases/${phase.id}`}
                  className="inline-flex items-center gap-2 text-primary-700 font-semibold hover:text-primary-800"
                >
                  Zobacz fazę
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
