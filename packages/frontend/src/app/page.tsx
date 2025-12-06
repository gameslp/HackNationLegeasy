'use client';

import { useState } from 'react';
import { useLaws } from '@/features/laws/hooks/useLaws';
import { LawCard } from '@/features/laws/components/LawCard';
import { Input, Select } from '@/components/ui/Input';
import { Search } from 'lucide-react';
import { PHASE_LABELS, PhaseType } from '@/lib/api/types';

const phaseOptions = [
  { value: '', label: 'Wszystkie fazy' },
  ...Object.entries(PHASE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const { data, isLoading, error } = useLaws(search, phaseFilter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ustawy w procesie legislacyjnym
        </h1>
        <p className="text-gray-600">
          Przeglądaj i śledź projekty ustaw na różnych etapach procesu legislacyjnego
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Szukaj ustawy po nazwie lub autorze..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={phaseOptions}
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Laws list */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Błąd ładowania ustaw</p>
        </div>
      ) : data?.laws.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Brak ustaw do wyświetlenia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.laws.map((law) => (
            <LawCard key={law.id} law={law} />
          ))}
        </div>
      )}

      {data && data.total > 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Wyświetlono {data.laws.length} z {data.total} ustaw
        </p>
      )}
    </div>
  );
}
