'use client';

import { useLaws, useDeleteLaw } from '@/features/laws/hooks/useLaws';
import { useAdminStats } from '@/features/admin/hooks/useAdmin';
import { useIdeas } from '@/features/ideas/hooks/useIdeas';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhaseBadge } from '@/components/ui/Badge';
import { PHASE_LABELS } from '@/lib/api/types';
import { Plus, Edit, Trash2, FileText, Layers, GitBranch, MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: stats } = useAdminStats();
  const { data: lawsData, isLoading } = useLaws();
  const { data: ideasData } = useIdeas();
  const deleteLaw = useDeleteLaw();

  // Liczba aktywnych pomysłów (status NEW lub COLLECTING)
  const activeIdeasCount = ideasData?.ideas.filter(
    (idea) => idea.status === 'NEW' || idea.status === 'COLLECTING'
  ).length || 0;

  const handleDelete = async (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę ustawę?')) {
      await deleteLaw.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/40 to-primary-200/20 rounded-full blur-3xl -z-10" />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Panel Administracyjny</h1>
            <p className="text-gray-600">Zarządzaj ustawami i procesem legislacyjnym</p>
          </div>
        <div className="flex gap-3">
          <Link href="/admin/ideas">
            <Button variant="secondary">
              <Lightbulb className="w-4 h-4 mr-2" />
              Pomysły
              {activeIdeasCount > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeIdeasCount}
                </span>
              )}
            </Button>
          </Link>
            <Link href="/admin/laws/new">
              <Button className="group shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Nowa ustawa
              </Button>
            </Link>
        </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200/60 hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100/30 rounded-full blur-2xl -z-10 group-hover:bg-primary-200/50 transition-colors" />
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalLaws}</p>
                <p className="text-sm text-gray-500 font-medium">Ustaw</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200/60 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/30 rounded-full blur-2xl -z-10 group-hover:bg-blue-200/50 transition-colors" />
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPhases}</p>
                <p className="text-sm text-gray-500 font-medium">Faz</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200/60 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100/30 rounded-full blur-2xl -z-10 group-hover:bg-green-200/50 transition-colors" />
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                <GitBranch className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStages}</p>
                <p className="text-sm text-gray-500 font-medium">Etapów</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200/60 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100/30 rounded-full blur-2xl -z-10 group-hover:bg-purple-200/50 transition-colors" />
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mr-4 shadow-md group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDiscussions}</p>
                <p className="text-sm text-gray-500 font-medium">Komentarzy</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Laws list */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-1 h-6 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full mr-3"></span>
            Ustawy
          </h2>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : lawsData?.laws.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Brak ustaw</p>
              <Link href="/admin/laws/new" className="text-primary-600 hover:underline mt-2 inline-block">
                Dodaj pierwszą ustawę
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nazwa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktualna faza
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data rozpoczęcia
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lawsData?.laws.map((law) => (
                    <tr key={law.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {law.name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {law.author}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {law.currentPhase ? (
                          <PhaseBadge phase={law.currentPhase} />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(law.startDate).toLocaleDateString('pl-PL')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/laws/${law.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(law.id)}
                            disabled={deleteLaw.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
