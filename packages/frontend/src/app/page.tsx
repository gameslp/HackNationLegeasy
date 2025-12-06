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
    <>
      {/* Hero Section with Red Accent Background - Full Width */}
      <div style={{height: "calc(100vh - 3rem)"}}></div>
      <div className="absolute w-screen inset-0 left-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Red gradient background */}
        <div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>

          {/* Mesh pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        </div>

        {/* Content */}
        <div className="relative w-full px-6 sm:px-12 lg:px-24 xl:px-32 py-24 sm:py-32 lg:py-40">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left side - Text content */}
              <div className="space-y-8">
                {/* Main Heading */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight">
                  Ustawy w procesie
                  <br />
                  <span className="bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
                    legislacyjnym
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl sm:text-2xl lg:text-3xl text-red-100 leading-relaxed font-medium">
                  Przeglądaj i śledź projekty ustaw na różnych etapach procesu legislacyjnego
                </p>

                {/* CTA or additional text */}
                <div className="pt-4">
                  <p className="text-lg text-red-50/90">
                    Transparentność i dostępność dla każdego obywatela
                  </p>
                </div>
              </div>

              {/* Right side - Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-8 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl lg:text-6xl font-bold mb-2">{data?.total || '...'}</div>
                  <div className="text-base lg:text-lg text-red-100 font-medium">Aktywnych ustaw</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-8 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl lg:text-6xl font-bold mb-2">6</div>
                  <div className="text-base lg:text-lg text-red-100 font-medium">Faz procesu legislacyjnego</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-8 text-white hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="text-5xl lg:text-6xl font-bold mb-2">100%</div>
                  <div className="text-base lg:text-lg text-red-100 font-medium">Przejrzystości procesu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - uses parent container */}
      <div className="space-y-8">

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
    </>
  );
}
