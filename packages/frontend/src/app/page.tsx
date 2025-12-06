'use client';

import { useState } from 'react';
import { useLaws } from '@/features/laws/hooks/useLaws';
import { LawCard } from '@/features/laws/components/LawCard';
import { Input, Select } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search, Filter, Scale, FileText, Users, ArrowRight } from 'lucide-react';
import { PHASE_LABELS } from '@/lib/api/types';
import Link from 'next/link';
import { BlurText } from '@/components/ui/BlurText';

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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-600 via-40% to-primary-800 animate-gradient"></div>
        {/* Decorative blurs on top of gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-900/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative px-8 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                <Scale className="w-4 h-4" />
                Transparentny proces legislacyjny
              </div>

              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                <BlurText text='Śledź ustawy' />
                <BlurText className="text-red-100" text="na każdym etapie" />
              </div>
              <p className="text-lg sm:text-xl text-red-100/90 max-w-lg">
                Przeglądaj projekty ustaw, porównuj zmiany między wersjami i zrozum proces legislacyjny dzięki analizie AI.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <a
                  href="#ustawy"
                  className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg hover:shadow-xl"
                >
                  Przeglądaj ustawy
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Panel administracyjny
                </Link>
              </div>
            </div>

            {/* Right - Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{data?.total || '—'}</div>
                    <div className="text-red-100 text-sm font-medium">Aktywnych ustaw</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">6</div>
                    <div className="text-red-100 text-sm font-medium">Faz legislacyjnych</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/15 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">100%</div>
                    <div className="text-red-100 text-sm font-medium">Dostępności dla obywateli</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200/60 hover:shadow-2xl hover:border-primary-200 hover:-translate-y-2 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl -z-10 group-hover:bg-primary-200/50 transition-colors duration-500" />
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">Pełna historia zmian</h3>
          <p className="text-gray-600 leading-relaxed">
            Śledź każdą zmianę w projekcie ustawy od początku do końca procesu legislacyjnego.
          </p>
        </div>

        <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200/60 hover:shadow-2xl hover:border-primary-200 hover:-translate-y-2 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl -z-10 group-hover:bg-primary-200/50 transition-colors duration-500" />
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">Porównanie wersji</h3>
          <p className="text-gray-600 leading-relaxed">
            Porównuj różne wersje dokumentów i zobacz dokładnie co się zmieniło.
          </p>
        </div>

        <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200/60 hover:shadow-2xl hover:border-primary-200 hover:-translate-y-2 transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl -z-10 group-hover:bg-primary-200/50 transition-colors duration-500" />
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">Analiza AI</h3>
          <p className="text-gray-600 leading-relaxed">
            Zrozum zmiany w ustawach dzięki wyjaśnieniom napisanym prostym językiem.
          </p>
        </div>
      </div>

      {/* Laws Section */}
      <div id="ustawy" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Projekty ustaw</h2>
          {data?.total && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {data.total} {data.total === 1 ? 'ustawa' : data.total < 5 ? 'ustawy' : 'ustaw'}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
              <Input
                placeholder="Szukaj ustawy po nazwie lub autorze..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12"
              />
            </div>
            <div className="w-full sm:w-64 relative group">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-600 transition-colors pointer-events-none z-10" />
              <Select
                options={phaseOptions}
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                className="pl-11"
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
          <div className="space-y-4">
            {data?.laws.map((law, index) => (
              <div
                key={law.id}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <LawCard law={law} />
              </div>
            ))}

            {data && data.total > data.laws.length && (
              <div className="text-center pt-6">
                <p className="text-sm font-medium text-gray-500 bg-white rounded-full px-6 py-3 inline-block shadow-sm border border-gray-100">
                  Wyświetlono {data.laws.length} z {data.total} ustaw
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
