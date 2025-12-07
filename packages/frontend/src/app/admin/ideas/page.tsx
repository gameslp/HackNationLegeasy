'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useIdeas } from '@/features/ideas/hooks/useIdeas';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  IDEA_AREA_LABELS,
  IDEA_STATUS_LABELS,
  IdeaArea,
  IdeaStatus,
} from '@/lib/api/types';
import {
  Plus,
  Search,
  Filter,
  Lightbulb,
  Users,
  MessageSquare,
  Calendar,
  ArrowRight,
  Building2,
} from 'lucide-react';

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

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  COLLECTING: 'bg-green-100 text-green-800',
  SUMMARIZING: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  CONVERTED: 'bg-purple-100 text-purple-800',
};

export default function AdminIdeasPage() {
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState<IdeaArea | ''>('');
  const [statusFilter, setStatusFilter] = useState<IdeaStatus | ''>('');

  const { data, isLoading, error } = useIdeas({
    search,
    area: areaFilter,
    status: statusFilter,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Zarządzanie pomysłami
          </h1>
          <p className="text-gray-600 mt-1">
            Etap 0 - Prekonsultacje społeczne
          </p>
        </div>
        <Link href="/admin/ideas/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nowy pomysł
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Szukaj..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={areaOptions}
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value as IdeaArea | '')}
          />
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as IdeaStatus | '')}
          />
        </div>
      </div>

      {/* Ideas list */}
      {isLoading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <EmptyState
          icon="alert"
          title="Błąd ładowania"
          description="Nie udało się pobrać listy pomysłów."
        />
      ) : data?.ideas.length === 0 ? (
        <EmptyState
          icon="search"
          title="Brak pomysłów"
          description={
            search || areaFilter || statusFilter
              ? 'Brak wyników dla podanych filtrów.'
              : 'Nie ma jeszcze żadnych pomysłów. Dodaj pierwszy!'
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Pomysł
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Obszar
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Termin
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                  Odpowiedzi
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.ideas.map((idea) => (
                <tr key={idea.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {idea.title}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {idea.ministry}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {IDEA_AREA_LABELS[idea.area]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[idea.status]
                      }`}
                    >
                      {IDEA_STATUS_LABELS[idea.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {idea.opinionDeadline ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {formatDate(idea.opinionDeadline)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {idea.totalSurveys || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {idea.totalOpinions || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/ideas/${idea.id}`}>
                      <Button variant="secondary" size="sm">
                        Zarządzaj
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
