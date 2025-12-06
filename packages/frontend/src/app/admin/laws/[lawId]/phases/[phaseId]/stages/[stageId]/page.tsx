'use client';

import { use, useState, useEffect, useRef } from 'react';
import {
  useLaw,
  usePhase,
  useStage,
  useUpdateStage,
  useUploadFile,
  useDeleteFile,
} from '@/features/laws/hooks/useLaws';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { PhaseBadge } from '@/components/ui/Badge';
import { FILE_TYPE_LABELS, FileType } from '@/lib/api/types';
import { ArrowLeft, Save, Upload, Trash2, FileText, Plus, X } from 'lucide-react';
import Link from 'next/link';

const fileTypeOptions = Object.entries(FILE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileType, setSelectedFileType] = useState<FileType>('LAW_PDF');

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    author: '',
    description: '',
    lawTextContent: '',
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
        lawTextContent: stage.lawTextContent || '',
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
        lawTextContent: formData.lawTextContent || null,
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
      fileType: selectedFileType,
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

            <Textarea
              label="Treść ustawy (do porównania wersji)"
              value={formData.lawTextContent}
              onChange={(e) =>
                setFormData({ ...formData, lawTextContent: e.target.value })
              }
              rows={12}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={updateStage.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Zapisz zmiany
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Files section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pliki</h2>
        </CardHeader>
        <CardContent>
          {/* Upload form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Select
                  label="Typ pliku"
                  options={fileTypeOptions}
                  value={selectedFileType}
                  onChange={(e) =>
                    setSelectedFileType(e.target.value as FileType)
                  }
                />
              </div>
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
                  {uploadFile.isPending ? 'Wysyłanie...' : 'Wybierz plik'}
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
    </div>
  );
}
