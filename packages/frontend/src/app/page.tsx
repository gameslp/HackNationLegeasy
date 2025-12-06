'use client';

import { useState } from 'react';
import { useLaws } from '@/features/laws/hooks/useLaws';
import { LawCard } from '@/features/laws/components/LawCard';
import { Input, Select } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Filter } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 bg-clip-text text-transparent">
          Ustawy w procesie legislacyjnym
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Przeglądaj i śledź projekty ustaw na różnych etapach procesu legislacyjnego
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/60">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
            <Input
              placeholder="Szukaj ustawy po nazwie lub autorze..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-64 relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-600 transition-colors pointer-events-none z-10" />
            <Select
              options={phaseOptions}
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Laws list */}
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Błąd ładowania ustaw"
          description="Nie udało się pobrać listy ustaw. Spróbuj odświeżyć stronę."
        />
      ) : data?.laws.length === 0 ? (
        <EmptyState
          icon="search"
          title="Brak wyników"
          description={
            search || phaseFilter
              ? 'Nie znaleziono ustaw spełniających kryteria wyszukiwania. Spróbuj zmienić filtry.'
              : 'Brak ustaw w systemie.'
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data?.laws.map((law, index) => (
              <div
                key={law.id}
                style={{
                  animation: 'fadeIn 0.5s ease-out',
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'both',
                }}
              >
                <LawCard law={law} />
              </div>
            ))}
          </div>

          {data && data.total > data.laws.length && (
            <div className="text-center pt-6">
              <p className="text-sm font-medium text-gray-600 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 inline-block shadow-sm">
                Wyświetlono {data.laws.length} z {data.total} ustaw
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
