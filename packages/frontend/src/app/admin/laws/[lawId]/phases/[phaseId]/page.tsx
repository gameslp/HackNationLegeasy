'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  useLaw,
  usePhase,
  useUpdatePhase,
  useCreateStage,
  useDeleteStage,
  useImportFileFromLink,
} from '@/features/laws/hooks/useLaws';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PhaseBadge } from '@/components/ui/Badge';
import { PHASE_LABELS, PhaseType, IDEA_AREA_LABELS, IDEA_STATUS_LABELS, RclScrapedStage, RclScrapedProject, RclProjectStage } from '@/lib/api/types';
import { apiClient } from '@/lib/api/client';
import { ArrowLeft, Plus, Edit, Trash2, Save, ExternalLink, Building2, Calendar, Users, MessageSquare, Download, Loader2 } from 'lucide-react';

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
  const importFileFromLink = useImportFileFromLink();

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

  // RCL import state (single stage)
  const [rclImportUrl, setRclImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<RclScrapedStage | null>(null);

  // RCL bulk import state (project)
  const [rclProjectUrl, setRclProjectUrl] = useState('');
  const [isScrapingProject, setIsScrapingProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [scrapedProject, setScrapedProject] = useState<RclScrapedProject | null>(null);
  const [selectedStages, setSelectedStages] = useState<Set<string>>(new Set());
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportProgress, setBulkImportProgress] = useState<string | null>(null);

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

    // Create the stage and get the new stage ID
    const newStage = await createStage.mutateAsync({
      lawId,
      phaseId,
      data: {
        name: stageFormData.name,
        date: new Date(stageFormData.date).toISOString(),
        author: stageFormData.author || null,
        description: stageFormData.description || null,
        governmentLinks: scrapedData ? [rclImportUrl] : [],
      },
    });

    // If we have scraped RCL data, import all files
    if (scrapedData && scrapedData.files.length > 0 && newStage?.id) {
      for (const file of scrapedData.files) {
        try {
          await importFileFromLink.mutateAsync({
            lawId,
            phaseId,
            stageId: newStage.id,
            url: file.url,
            name: file.name,
            stageName: stageFormData.name,
          });
        } catch (error) {
          console.error('Failed to import file:', file.name, error);
        }
      }
    }

    setShowStageForm(false);
    setStageFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      author: '',
      description: '',
    });
    // Reset RCL import state
    setRclImportUrl('');
    setScrapedData(null);
    setImportError(null);
  };

  const handleDeleteStage = async (stageId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten etap?')) {
      await deleteStage.mutateAsync({ lawId, phaseId, stageId });
    }
  };

  // Parse DD-MM-YYYY date to YYYY-MM-DD format
  const parseRclDate = (dateStr: string | null): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleRclImport = async () => {
    if (!rclImportUrl) return;

    setIsImporting(true);
    setImportError(null);
    setScrapedData(null);

    try {
      const result = await apiClient.post<RclScrapedStage>('/admin/scrape-rcl-stage', {
        url: rclImportUrl,
      });

      setScrapedData(result);

      // Auto-fill the form with scraped data
      setStageFormData({
        name: result.stageName,
        date: parseRclDate(result.lastModified),
        author: result.files[0]?.author || '',
        description: result.directories.length > 0
          ? `Katalogi: ${result.directories.map(d => d.name).join(', ')}`
          : '',
      });

      // Show the stage form if not already visible
      setShowStageForm(true);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Błąd importu');
    } finally {
      setIsImporting(false);
    }
  };

  // Bulk import handlers
  const handleScrapeProject = async () => {
    if (!rclProjectUrl) return;

    setIsScrapingProject(true);
    setProjectError(null);
    setScrapedProject(null);
    setSelectedStages(new Set());

    try {
      const result = await apiClient.post<RclScrapedProject>('/admin/scrape-rcl-project', {
        url: rclProjectUrl,
      });
      setScrapedProject(result);
      // Auto-select all active stages with catalog URLs
      const activeStageIds = new Set(
        result.stages
          .filter(s => s.isActive && s.catalogUrl)
          .map(s => s.stageId!)
      );
      setSelectedStages(activeStageIds);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Błąd skanowania projektu');
    } finally {
      setIsScrapingProject(false);
    }
  };

  const toggleStageSelection = (stageId: string) => {
    const newSelected = new Set(selectedStages);
    if (newSelected.has(stageId)) {
      newSelected.delete(stageId);
    } else {
      newSelected.add(stageId);
    }
    setSelectedStages(newSelected);
  };

  const handleBulkImport = async () => {
    if (!scrapedProject || selectedStages.size === 0) return;

    setIsBulkImporting(true);
    setBulkImportProgress(null);

    const stagesToImport = scrapedProject.stages.filter(
      s => s.stageId && selectedStages.has(s.stageId)
    );

    for (let i = 0; i < stagesToImport.length; i++) {
      const stage = stagesToImport[i];
      setBulkImportProgress(`Importowanie ${i + 1}/${stagesToImport.length}: ${stage.stageName}`);

      try {
        // First scrape the stage details
        const stageData = await apiClient.post<RclScrapedStage>('/admin/scrape-rcl-stage', {
          url: stage.catalogUrl,
        });

        // Create the stage
        const newStage = await createStage.mutateAsync({
          lawId,
          phaseId,
          data: {
            name: stageData.stageName,
            date: new Date(parseRclDate(stageData.lastModified)).toISOString(),
            author: stageData.files[0]?.author || null,
            description: stageData.directories.length > 0
              ? `Katalogi: ${stageData.directories.map(d => d.name).join(', ')}`
              : null,
            governmentLinks: [stage.catalogUrl!],
            order: stage.stageNumber,
          },
        });

        // Import all files for this stage
        if (newStage?.id && stageData.files.length > 0) {
          for (const file of stageData.files) {
            try {
              await importFileFromLink.mutateAsync({
                lawId,
                phaseId,
                stageId: newStage.id,
                url: file.url,
                name: file.name,
                stageName: stageData.stageName,
              });
            } catch (fileError) {
              console.error('Failed to import file:', file.name, fileError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to import stage:', stage.stageName, error);
      }
    }

    setBulkImportProgress(null);
    setIsBulkImporting(false);
    setScrapedProject(null);
    setSelectedStages(new Set());
    setRclProjectUrl('');
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
          {/* RCL Import section - only show for RCL phase */}
          {phase?.type === 'RCL' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Importuj z RCL
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="https://legislacja.rcl.gov.pl/projekt/.../katalog/...#..."
                  value={rclImportUrl}
                  onChange={(e) => setRclImportUrl(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleRclImport}
                  disabled={isImporting || !rclImportUrl}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importowanie...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Importuj
                    </>
                  )}
                </Button>
              </div>
              {importError && (
                <p className="text-red-600 text-sm mt-2">{importError}</p>
              )}
              {scrapedData && (
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800 text-sm font-medium">
                    Zaimportowano dane etapu: {scrapedData.stageName}
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    {scrapedData.files.length} plików, {scrapedData.directories.length} katalogów
                  </p>
                </div>
              )}
              <p className="text-xs text-blue-700 mt-2">
                Wklej link do etapu z legislacja.rcl.gov.pl (z hashem #), aby automatycznie wypełnić formularz.
              </p>

              {/* Bulk import from project */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Import zbiorczy z projektu RCL</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://legislacja.rcl.gov.pl/projekt/12404152/"
                    value={rclProjectUrl}
                    onChange={(e) => setRclProjectUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleScrapeProject}
                    disabled={isScrapingProject || !rclProjectUrl}
                    variant="secondary"
                  >
                    {isScrapingProject ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Skanowanie...
                      </>
                    ) : (
                      'Skanuj projekt'
                    )}
                  </Button>
                </div>

                {projectError && (
                  <p className="text-red-600 text-sm mt-2">{projectError}</p>
                )}

                {scrapedProject && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{scrapedProject.projectTitle}</p>
                        <p className="text-xs text-gray-500">
                          Projekt #{scrapedProject.projectId} • {scrapedProject.stages.filter(s => s.isActive).length} aktywnych etapów
                        </p>
                      </div>
                      <Button
                        onClick={handleBulkImport}
                        disabled={isBulkImporting || selectedStages.size === 0}
                        size="sm"
                      >
                        {isBulkImporting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Importowanie...
                          </>
                        ) : (
                          `Importuj ${selectedStages.size} etapów`
                        )}
                      </Button>
                    </div>

                    {bulkImportProgress && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                        <Loader2 className="w-3 h-3 inline-block mr-2 animate-spin" />
                        {bulkImportProgress}
                      </div>
                    )}

                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {scrapedProject.stages.map((stage) => (
                        <div
                          key={stage.stageNumber}
                          className={`flex items-center justify-between p-2 rounded ${
                            stage.isActive && stage.stageId
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {stage.isActive && stage.stageId && (
                              <input
                                type="checkbox"
                                checked={selectedStages.has(stage.stageId)}
                                onChange={() => toggleStageSelection(stage.stageId!)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                            )}
                            <div>
                              <p className={`text-sm ${stage.isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                                {stage.stageName}
                              </p>
                              {stage.lastModified && (
                                <p className="text-xs text-gray-500">{stage.lastModified}</p>
                              )}
                            </div>
                          </div>
                          {!stage.isActive && (
                            <span className="text-xs text-gray-400">Nieaktywny</span>
                          )}
                          {stage.isActive && !stage.stageId && (
                            <span className="text-xs text-gray-400">Brak katalogu</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-blue-700 mt-2">
                  Wklej link do projektu RCL, aby zaimportować wszystkie aktywne etapy jednocześnie.
                </p>
              </div>
            </div>
          )}

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
              {scrapedData && scrapedData.files.length > 0 ? (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Pliki do zaimportowania ({scrapedData.files.length}):
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 max-h-32 overflow-y-auto">
                    {scrapedData.files.map((file, idx) => (
                      <li key={idx} className="truncate">
                        • {file.name} {file.author && `(${file.author})`}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">
                    Pliki zostaną dostępne do importu po utworzeniu etapu.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Po utworzeniu etapu będziesz mógł dodać PDF ustawy i pliki powiązane.
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowStageForm(false)}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={createStage.isPending || importFileFromLink.isPending}>
                  {createStage.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Tworzenie...
                    </>
                  ) : importFileFromLink.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importowanie plików...
                    </>
                  ) : scrapedData && scrapedData.files.length > 0 ? (
                    `Dodaj i importuj ${scrapedData.files.length} plików`
                  ) : (
                    'Dodaj'
                  )}
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
