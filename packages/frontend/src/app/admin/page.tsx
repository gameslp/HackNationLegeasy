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
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Administracyjny</h1>
          <p className="text-gray-600 mt-1">Zarządzaj ustawami i procesem legislacyjnym</p>
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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nowa ustawa
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalLaws}</p>
                  <p className="text-sm text-gray-500">Ustaw</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center">
                <Layers className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalPhases}</p>
                  <p className="text-sm text-gray-500">Faz</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center">
                <GitBranch className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStages}</p>
                  <p className="text-sm text-gray-500">Etapów</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalDiscussions}</p>
                  <p className="text-sm text-gray-500">Komentarzy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Laws list */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Ustawy</h2>
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
