'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useLaw,
  usePhase,
  useUpdatePhase,
  useCreateStage,
  useDeleteStage,
} from '@/features/laws/hooks/useLaws';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PhaseBadge } from '@/components/ui/Badge';
import { PHASE_LABELS, PhaseType, IDEA_AREA_LABELS, IDEA_STATUS_LABELS } from '@/lib/api/types';
import { ArrowLeft, Plus, Edit, Trash2, Save, ExternalLink, Building2, Calendar, Users, MessageSquare } from 'lucide-react';

const phaseTypeOptions = Object.entries(PHASE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function AdminPhasePage({
  params,
}: {
  params: Promise<{ lawId: string; phaseId: string }>;
}) {
  const { lawId, phaseId } = use(params);
  const { data: law } = useLaw(lawId);
  const { data: phase, isLoading } = usePhase(lawId, phaseId);
  const updatePhase = useUpdatePhase();
  const createStage = useCreateStage();
  const deleteStage = useDeleteStage();

  const [formData, setFormData] = useState({
    type: 'PRECONSULTATION' as PhaseType,
    startDate: '',
    endDate: '',
  });

  const [showStageForm, setShowStageForm] = useState(false);
  const [stageFormData, setStageFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    description: '',
  });

  useEffect(() => {
    if (phase) {
      setFormData({
        type: phase.type,
        startDate: new Date(phase.startDate).toISOString().split('T')[0],
        endDate: phase.endDate
          ? new Date(phase.endDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [phase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updatePhase.mutateAsync({
      lawId,
      phaseId,
      data: {
        type: formData.type,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
      },
    });
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();

    await createStage.mutateAsync({
      lawId,
      phaseId,
      data: {
        name: stageFormData.name,
        date: new Date(stageFormData.date).toISOString(),
        author: stageFormData.author || null,
        description: stageFormData.description || null,
        governmentLinks: [],
      },
    });

    setShowStageForm(false);
    setStageFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      author: '',
      description: '',
    });
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten etap?')) {
      await deleteStage.mutateAsync({ lawId, phaseId, stageId });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  // Specjalny widok dla fazy PRECONSULTATION z powiązanym pomysłem
  if (phase?.type === 'PRECONSULTATION' && phase.idea) {
    const idea = phase.idea;
    const totalSurveys = idea.surveyResponses?.length || 0;
    const totalOpinions = idea.opinions?.length || 0;

    return (
      <div>
        <Link
          href={`/admin/laws/${lawId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Wróć do ustawy
        </Link>

        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <PhaseBadge phase={phase.type} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Faza Prekonsultacji</h1>
          <p className="text-gray-500 mt-1">{law?.name}</p>
        </div>

        {/* Info o powiązanym pomyśle */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Powiązany pomysł</h2>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      {IDEA_AREA_LABELS[idea.area as keyof typeof IDEA_AREA_LABELS]}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {IDEA_STATUS_LABELS[idea.status as keyof typeof IDEA_STATUS_LABELS]}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 mb-4">{idea.shortDescription}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      <span>{idea.ministry}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(idea.publishDate).toLocaleDateString('pl-PL')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{totalSurveys} głosów</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{totalOpinions} opinii</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link href={`/admin/ideas/${idea.id}`}>
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj pomysł
                  </Button>
                </Link>
                <Link href={`/ideas/${idea.id}`} target="_blank">
                  <Button variant="secondary">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Zobacz stronę publiczną
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Uwaga:</strong> Faza prekonsultacji wykorzystuje dane z panelu pomysłów.
                Aby edytować treść, pytania, timeline lub załączniki - przejdź do edycji pomysłu.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dane fazy (tylko daty) */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Daty fazy</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data rozpoczęcia"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
                <Input
                  label="Data zakończenia (opcjonalna)"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={updatePhase.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Standardowy widok dla innych faz
  return (
    <div>
      <Link
        href={`/admin/laws/${lawId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do ustawy
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edytuj fazę</h1>
        <p className="text-gray-500 mt-1">{law?.name}</p>
      </div>

      {/* Phase form */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center space-x-2">
            {phase && <PhaseBadge phase={phase.type} />}
            <h2 className="text-lg font-semibold">Dane fazy</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Typ fazy"
              options={phaseTypeOptions}
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as PhaseType })
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data rozpoczęcia"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
              <Input
                label="Data zakończenia (opcjonalna)"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={updatePhase.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz zmiany
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stages section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Etapy</h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowStageForm(!showStageForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj etap
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add stage form */}
          {showStageForm && (
            <form
              onSubmit={handleAddStage}
              className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
            >
              <Input
                label="Nazwa etapu"
                value={stageFormData.name}
                onChange={(e) =>
                  setStageFormData({ ...stageFormData, name: e.target.value })
                }
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data"
                  type="date"
                  value={stageFormData.date}
                  onChange={(e) =>
                    setStageFormData({ ...stageFormData, date: e.target.value })
                  }
                  required
                />
                <Input
                  label="Autor (opcjonalny)"
                  value={stageFormData.author}
                  onChange={(e) =>
                    setStageFormData({ ...stageFormData, author: e.target.value })
                  }
                />
              </div>
              <Textarea
                label="Opis (opcjonalny)"
                value={stageFormData.description}
                onChange={(e) =>
                  setStageFormData({
                    ...stageFormData,
                    description: e.target.value,
                  })
                }
              />
              <p className="text-sm text-gray-500">
                Po utworzeniu etapu będziesz mógł dodać PDF ustawy i pliki powiązane.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowStageForm(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={createStage.isPending}>
                  Dodaj
                </Button>
              </div>
            </form>
          )}

          {/* Stages list */}
          {phase?.stages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Brak etapów. Dodaj pierwszy etap.
            </p>
          ) : (
            <div className="space-y-3">
              {phase?.stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{stage.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(stage.date).toLocaleDateString('pl-PL')}
                      {stage.author && ` • ${stage.author}`}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/laws/${lawId}/phases/${phaseId}/stages/${stage.id}`}
                    >
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStage(stage.id)}
                      disabled={deleteStage.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
