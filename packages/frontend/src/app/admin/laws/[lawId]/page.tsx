'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useLaw,
  useCreateLaw,
  useUpdateLaw,
  useCreatePhase,
  useDeletePhase,
  useImportSejmProcess,
} from '@/features/laws/hooks/useLaws';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PhaseBadge } from '@/components/ui/Badge';
import { PHASE_LABELS, PhaseType } from '@/lib/api/types';
import { ArrowLeft, Plus, Edit, Trash2, Save, Download, Loader } from 'lucide-react';
import Link from 'next/link';

const phaseTypeOptions = Object.entries(PHASE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function AdminLawPage({
  params,
}: {
  params: Promise<{ lawId: string }>;
}) {
  const { lawId } = use(params);
  const router = useRouter();
  const isNew = lawId === 'new';

  const { data: law, isLoading } = useLaw(lawId);
  const createLaw = useCreateLaw();
  const updateLaw = useUpdateLaw();
  const createPhase = useCreatePhase();
  const deletePhase = useDeletePhase();
  const importSejmProcess = useImportSejmProcess();

  const [formData, setFormData] = useState({
    name: '',
    author: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    publishDate: '',
    term: '',
    processNumber: '',
  });

  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [phaseFormData, setPhaseFormData] = useState({
    type: 'PRECONSULTATION' as PhaseType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });


  useEffect(() => {
    if (law && !isNew) {
      setFormData({
        name: law.name,
        author: law.author,
        description: law.description,
        startDate: new Date(law.startDate).toISOString().split('T')[0],
        publishDate: law.publishDate
          ? new Date(law.publishDate).toISOString().split('T')[0]
          : '',
        term: law.term?.toString() || '',
        processNumber: law.processNumber || '',
      });
    }
  }, [law, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      author: formData.author,
      description: formData.description,
      startDate: new Date(formData.startDate).toISOString(),
      publishDate: formData.publishDate
        ? new Date(formData.publishDate).toISOString()
        : null,
    };

    if (isNew) {
      const result = await createLaw.mutateAsync(data);
      router.push(`/admin/laws/${result.id}`);
    } else {
      await updateLaw.mutateAsync({ id: lawId, data });
    }
  };

  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();

    await createPhase.mutateAsync({
      lawId,
      data: {
        type: phaseFormData.type,
        startDate: new Date(phaseFormData.startDate).toISOString(),
        endDate: phaseFormData.endDate
          ? new Date(phaseFormData.endDate).toISOString()
          : null,
      },
    });

    setShowPhaseForm(false);
    setPhaseFormData({
      type: 'PRECONSULTATION',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę fazę?')) {
      await deletePhase.mutateAsync({ lawId, phaseId });
    }
  };

  const handleImportFromSejm = async () => {
    if (!formData.term || !formData.processNumber) {
      return;
    }

    try {
      const result = await importSejmProcess.mutateAsync({
        term: parseInt(formData.term),
        processNumber: formData.processNumber,
      });
      // Przekieruj do nowo utworzonej ustawy
      router.push(`/admin/laws/${result.id}`);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do panelu
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isNew ? 'Nowa ustawa' : 'Edytuj ustawę'}
      </h1>

      {/* Law form */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Dane ustawy</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nazwa ustawy"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              label="Wnioskodawca (autor)"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              required
            />
            <Textarea
              label="Opis"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
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
                label="Data publikacji (opcjonalna)"
                type="date"
                value={formData.publishDate}
                onChange={(e) =>
                  setFormData({ ...formData, publishDate: e.target.value })
                }
              />
            </div>

            {/* Sejm Import Fields */}
            {isNew && (
              <>
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Import z Sejm API (opcjonalny)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Numer kadencji (np. 10)"
                      type="number"
                      value={formData.term}
                      onChange={(e) =>
                        setFormData({ ...formData, term: e.target.value })
                      }
                      placeholder="10"
                    />
                    <Input
                      label="Numer procesu"
                      value={formData.processNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          processNumber: e.target.value,
                        })
                      }
                      placeholder="1"
                    />
                  </div>
                  {importSejmProcess.isError && (
                    <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      {importSejmProcess.error?.message || 'Błąd podczas importu'}
                    </div>
                  )}
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleImportFromSejm}
                      disabled={
                        importSejmProcess.isPending ||
                        !formData.term ||
                        !formData.processNumber
                      }
                    >
                      {importSejmProcess.isPending ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Importowanie...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Importuj z Sejm API
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Import automatycznie utworzy ustawę wraz z fazami i
                      etapami z Sejm API
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Lub utwórz ustawę ręcznie:
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createLaw.isPending || updateLaw.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isNew ? 'Utwórz ustawę ręcznie' : 'Zapisz zmiany'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Phases section (only for existing laws) */}
      {!isNew && law && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Fazy</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPhaseForm(!showPhaseForm)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Dodaj fazę
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add phase form */}
            {showPhaseForm && (
              <form
                onSubmit={handleAddPhase}
                className="mb-6 p-4 bg-gray-50 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Select
                    label="Typ fazy"
                    options={phaseTypeOptions}
                    value={phaseFormData.type}
                    onChange={(e) =>
                      setPhaseFormData({
                        ...phaseFormData,
                        type: e.target.value as PhaseType,
                      })
                    }
                  />
                  <Input
                    label="Data rozpoczęcia"
                    type="date"
                    value={phaseFormData.startDate}
                    onChange={(e) =>
                      setPhaseFormData({
                        ...phaseFormData,
                        startDate: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    label="Data zakończenia (opcjonalna)"
                    type="date"
                    value={phaseFormData.endDate}
                    onChange={(e) =>
                      setPhaseFormData({
                        ...phaseFormData,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowPhaseForm(false)}
                  >
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={createPhase.isPending}>
                    Dodaj
                  </Button>
                </div>
              </form>
            )}

            {/* Phases list */}
            {law.phases.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Brak faz. Dodaj pierwszą fazę.
              </p>
            ) : (
              <div className="space-y-3">
                {law.phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <PhaseBadge phase={phase.type} />
                      <div>
                        <p className="text-sm text-gray-500">
                          {new Date(phase.startDate).toLocaleDateString('pl-PL')}
                          {phase.endDate &&
                            ` - ${new Date(phase.endDate).toLocaleDateString('pl-PL')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/laws/${lawId}/phases/${phase.id}`}
                      >
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePhase(phase.id)}
                        disabled={deletePhase.isPending}
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
      )}
    </div>
  );
}
