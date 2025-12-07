'use client';

import { use, useState, useEffect, useRef } from 'react';
import {
  useLaw,
  usePhase,
  useStage,
  useUpdateStage,
  useUploadFile,
  useDeleteFile,
  useUploadLawPdf,
  useDeleteLawPdf,
} from '@/features/laws/hooks/useLaws';
import {
  useAdminStageImpact,
  useGenerateImpact,
  useToggleImpactPublish,
} from '@/features/laws/hooks/useImpact';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { PhaseBadge } from '@/components/ui/Badge';
import { ArrowLeft, Save, Upload, Trash2, FileText, Plus, X, FileUp, Download, Radar, Sparkles, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { ImpactRadarChart, OverallScoreDisplay, ScoreBadge } from '@/components/ui/ImpactRadarChart';
import Link from 'next/link';
import { FILE_TYPE_LABELS } from '@/lib/api/types';

export default function AdminStagePage({
  params,
}: {
  params: Promise<{ lawId: string; phaseId: string; stageId: string }>;
}) {
  const { lawId, phaseId, stageId } = use(params);
  const { data: law } = useLaw(lawId);
  const { data: phase } = usePhase(lawId, phaseId);
  const { data: stage, isLoading } = useStage(lawId, phaseId, stageId);
  const updateStage = useUpdateStage();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();
  const uploadLawPdf = useUploadLawPdf();
  const deleteLawPdf = useDeleteLawPdf();

  // Impact Analysis hooks
  const { data: impactData, isLoading: impactLoading } = useAdminStageImpact(stageId);
  const generateImpact = useGenerateImpact();
  const togglePublish = useToggleImpactPublish();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lawPdfInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    author: '',
    description: '',
    governmentLinks: [] as string[],
  });

  const [newLink, setNewLink] = useState('');

  useEffect(() => {
    if (stage) {
      const links =
        typeof stage.governmentLinks === 'string'
          ? JSON.parse(stage.governmentLinks)
          : stage.governmentLinks || [];

      setFormData({
        name: stage.name,
        date: new Date(stage.date).toISOString().split('T')[0],
        author: stage.author || '',
        description: stage.description || '',
        governmentLinks: links,
      });
    }
  }, [stage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateStage.mutateAsync({
      lawId,
      phaseId,
      stageId,
      data: {
        name: formData.name,
        date: new Date(formData.date).toISOString(),
        author: formData.author || null,
        description: formData.description || null,
        governmentLinks: formData.governmentLinks,
      },
    });
  };

  const handleAddLink = () => {
    if (newLink && !formData.governmentLinks.includes(newLink)) {
      setFormData({
        ...formData,
        governmentLinks: [...formData.governmentLinks, newLink],
      });
      setNewLink('');
    }
  };

  const handleRemoveLink = (link: string) => {
    setFormData({
      ...formData,
      governmentLinks: formData.governmentLinks.filter((l) => l !== link),
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile.mutateAsync({
      lawId,
      phaseId,
      stageId,
      file,
      fileType: 'RELATED',
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
      await deleteFile.mutateAsync({ lawId, phaseId, stageId, fileId });
    }
  };

  const handleLawPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadLawPdf.mutateAsync({
      lawId,
      phaseId,
      stageId,
      file,
    });

    if (lawPdfInputRef.current) {
      lawPdfInputRef.current.value = '';
    }
  };

  const handleDeleteLawPdf = async () => {
    if (confirm('Czy na pewno chcesz usunąć PDF ustawy? Usunie to również wyekstrahowaną treść.')) {
      await deleteLawPdf.mutateAsync({ lawId, phaseId, stageId });
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/admin/laws/${lawId}/phases/${phaseId}`}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Wróć do fazy
      </Link>

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-1">
          {phase && <PhaseBadge phase={phase.type} />}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edytuj etap</h1>
        <p className="text-gray-500 mt-1">{law?.name}</p>
      </div>

      {/* Stage form */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Dane etapu</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nazwa etapu"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
              <Input
                label="Autor (opcjonalny)"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </div>
            <Textarea
              label="Opis (opcjonalny)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            {/* Government links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linki do stron rządowych
              </label>
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="https://..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                />
                <Button type="button" variant="secondary" onClick={handleAddLink}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.governmentLinks.length > 0 && (
                <div className="space-y-2">
                  {formData.governmentLinks.map((link, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline truncate"
                      >
                        {link}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(link)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateStage.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz zmiany
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Law PDF section */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">PDF Ustawy</h2>
          <p className="text-sm text-gray-500 mt-1">
            Główny dokument PDF ustawy dla tego etapu. Treść zostanie automatycznie wyekstrahowana do porównania wersji.
          </p>
        </CardHeader>
        <CardContent>
          {stage?.lawPdfPath ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{stage.lawPdfName || 'law.pdf'}</p>
                  <p className="text-xs text-gray-500">
                    {stage.lawTextContent
                      ? `Wyekstrahowano ${stage.lawTextContent.length} znaków tekstu`
                      : 'Brak wyekstrahowanego tekstu'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={`${API_URL}/laws/${lawId}/phases/${phaseId}/stages/${stageId}/law-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Pobierz
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteLawPdf}
                  disabled={deleteLawPdf.isPending}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <FileUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">
                  Prześlij PDF ustawy, aby umożliwić porównanie wersji
                </p>
                <input
                  ref={lawPdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleLawPdfUpload}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  onClick={() => lawPdfInputRef.current?.click()}
                  disabled={uploadLawPdf.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadLawPdf.isPending ? 'Przesyłanie...' : 'Prześlij PDF'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pliki powiązane</h2>
        </CardHeader>
        <CardContent>
          {/* Upload form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Dodaj dokumenty powiązane z tym etapem (np. uzasadnienia, opinie, załączniki)
              </p>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFile.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadFile.isPending ? 'Wysyłanie...' : 'Dodaj plik'}
                </Button>
              </div>
            </div>
          </div>

          {/* Files list */}
          {stage?.files && stage.files.length > 0 ? (
            <div className="space-y-2">
              {stage.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {FILE_TYPE_LABELS[file.fileType]} •{' '}
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deleteFile.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Brak plików. Dodaj pliki używając formularza powyżej.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Impact Analysis section */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold">Analiza Wpływu (Impact Radar)</h2>
            </div>
            {impactData?.analysis && (
              <div className="flex items-center space-x-2">
                <Button
                  variant={impactData.analysis.isPublished ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() =>
                    togglePublish.mutate({
                      stageId,
                      isPublished: !impactData.analysis!.isPublished,
                    })
                  }
                  disabled={togglePublish.isPending}
                >
                  {impactData.analysis.isPublished ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Ukryj
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Opublikuj
                    </>
                  )}
                </Button>
                <Link href={`/laws/${lawId}/impact`} target="_blank">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {impactLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : impactData?.analysis ? (
            <div className="space-y-6">
              {/* Status badge */}
              <div className="flex items-center space-x-2">
                {impactData.analysis.isPublished ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Eye className="w-3 h-3 mr-1" />
                    Opublikowana
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Nieopublikowana
                  </span>
                )}
                {impactData.analysis.editedByAdmin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Edytowana
                  </span>
                )}
              </div>

              {/* Radar chart and scores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ImpactRadarChart analysis={impactData.analysis} height={300} />
                </div>
                <div>
                  <OverallScoreDisplay
                    score={impactData.analysis.overallScore}
                    mainAffectedGroup={impactData.analysis.mainAffectedGroup}
                    uncertaintyLevel={impactData.analysis.uncertaintyLevel}
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ScoreBadge score={impactData.analysis.economicScore} label="Ekon." size="sm" />
                    <ScoreBadge score={impactData.analysis.socialScore} label="Społ." size="sm" />
                    <ScoreBadge score={impactData.analysis.administrativeScore} label="Admin." size="sm" />
                    <ScoreBadge score={impactData.analysis.technologicalScore} label="Tech." size="sm" />
                    <ScoreBadge score={impactData.analysis.environmentalScore} label="Środ." size="sm" />
                  </div>
                </div>
              </div>

              {/* Simple summary */}
              {impactData.analysis.simpleSummary.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold text-amber-900 mb-2">Co to zmienia?</h3>
                  <ul className="space-y-1">
                    {impactData.analysis.simpleSummary.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-amber-800">
                        {i + 1}. {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => generateImpact.mutate(stageId)}
                  disabled={generateImpact.isPending}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {generateImpact.isPending ? 'Generowanie...' : 'Wygeneruj ponownie'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-right">
                Wygenerowano:{' '}
                {new Date(impactData.analysis.generatedAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Radar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                Analiza wpływu nie została jeszcze wygenerowana dla tego etapu.
              </p>
              {!stage?.lawTextContent && (
                <p className="text-sm text-amber-600 mb-4">
                  Aby wygenerować analizę, najpierw prześlij PDF ustawy.
                </p>
              )}
              <Button
                onClick={() => generateImpact.mutate(stageId)}
                disabled={generateImpact.isPending}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {generateImpact.isPending ? 'Generowanie...' : 'Wygeneruj analizę AI'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
