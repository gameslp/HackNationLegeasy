'use client';

import { useState } from 'react';
import { useIdeas } from '@/features/ideas/hooks/useIdeas';
import { IdeaCard } from '@/features/ideas/components/IdeaCard';
import { Input, Select } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Search,
  Filter,
  Lightbulb,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  IDEA_AREA_LABELS,
  IDEA_STATUS_LABELS,
  IdeaArea,
  IdeaStatus,
} from '@/lib/api/types';
import Link from 'next/link';

const areaOptions = [
  { value: '', label: 'Wszystkie obszary' },
  ...Object.entries(IDEA_AREA_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const statusOptions = [
  { value: '', label: 'Wszystkie statusy' },
  ...Object.entries(IDEA_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const sortOptions = [
  { value: 'newest', label: 'Najnowsze' },
  { value: 'deadline', label: 'Kończy się wkrótce' },
  { value: 'oldest', label: 'Najstarsze' },
];

export default function IdeasPage() {
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<IdeaArea | ''>('');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | ''>('');
  const [sort, setSort] = useState<'newest' | 'deadline' | 'oldest'>('newest');

  const { data, isLoading, error } = useIdeas({
    search,
    area: areaFilter,
    status: statusFilter,
    sort,
  });

  // Oblicz statystyki
  const openIdeas =
    data?.ideas.filter(
      (i) => i.status === 'NEW' || i.status === 'COLLECTING'
    ).length || 0;
  const totalSurveys =
    data?.ideas.reduce((sum, i) => sum + (i.totalSurveys || 0), 0) || 0;
  const totalOpinions =
    data?.ideas.reduce((sum, i) => sum + (i.totalOpinions || 0), 0) || 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Content */}
        <div className="relative px-8 py-12 sm:px-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left - Text */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium">
                <Lightbulb className="w-4 h-4" />
                Etap 0 – Prekonsultacje
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Pomysły nowych regulacji
              </h1>

              <p className="text-lg text-orange-100/90 max-w-lg">
                Tu możesz wypowiedzieć się, zanim powstanie projekt ustawy.
                Twój głos ma znaczenie od samego początku procesu
                legislacyjnego.
              </p>

              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Zobacz ustawy w procesie
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right - Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{openIdeas}</div>
                    <div className="text-orange-100 text-xs font-medium">
                      Otwartych pomysłów
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalSurveys}</div>
                    <div className="text-orange-100 text-xs font-medium">
                      Głosów w ankietach
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-white hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{totalOpinions}</div>
                    <div className="text-orange-100 text-xs font-medium">
                      Opinii obywateli
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Czym jest Etap 0?
              </h3>
              <p className="text-sm text-gray-600">
                Zanim powstanie ustawa, powstaje rozmowa. Tu zbieramy Twoje
                opinie na wczesnym etapie.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Jak to działa?
              </h3>
              <p className="text-sm text-gray-600">
                Odpowiedz na ankietę, podziel się opinią. Twój głos trafi do
                podsumowania dla urzędników.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Co dalej z pomysłem?
              </h3>
              <p className="text-sm text-gray-600">
                Po zebraniu opinii ministerstwo decyduje czy tworzyć projekt
                ustawy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
            <Input
              placeholder="Szukaj pomysłu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors pointer-events-none z-10" />
            <Select
              options={areaOptions}
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value as IdeaArea | '')}
              className="pl-11"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors pointer-events-none z-10" />
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as IdeaStatus | '')
              }
              className="pl-11"
            />
          </div>

          <Select
            options={sortOptions}
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as 'newest' | 'deadline' | 'oldest')
            }
          />
        </div>
      </div>

      {/* Ideas list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Pomysły w prekonsultacjach
          </h2>
          {data?.total !== undefined && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {data.total}{' '}
              {data.total === 1
                ? 'pomysł'
                : data.total < 5
                ? 'pomysły'
                : 'pomysłów'}
            </span>
          )}
        </div>

        {isLoading ? (
          <ListSkeleton count={5} />
        ) : error ? (
          <EmptyState
            icon="alert"
            title="Błąd ładowania pomysłów"
            description="Nie udało się pobrać listy pomysłów. Spróbuj odświeżyć stronę."
          />
        ) : data?.ideas.length === 0 ? (
          <EmptyState
            icon="search"
            title="Brak wyników"
            description={
              search || areaFilter || statusFilter
                ? 'Nie znaleziono pomysłów spełniających kryteria. Spróbuj zmienić filtry.'
                : 'Brak pomysłów w systemie.'
            }
          />
        ) : (
          <div className="space-y-4">
            {data?.ideas.map((idea, index) => (
              <div
                key={idea.id}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <IdeaCard idea={idea} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
