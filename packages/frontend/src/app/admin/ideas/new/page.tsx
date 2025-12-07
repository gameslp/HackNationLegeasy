'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateIdea } from '@/features/ideas/hooks/useIdeas';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import {
  IDEA_AREA_LABELS,
  IDEA_STATUS_LABELS,
  IDEA_STAGE_LABELS,
  IdeaArea,
  IdeaStatus,
  IdeaStage,
} from '@/lib/api/types';
import {
  ArrowLeft,
  Lightbulb,
  Plus,
  Trash2,
  Calendar,
  HelpCircle,
} from 'lucide-react';

const areaOptions = Object.entries(IDEA_AREA_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const statusOptions = Object.entries(IDEA_STATUS_LABELS)
  .filter(([value]) => ['NEW', 'COLLECTING'].includes(value))
  .map(([value, label]) => ({ value, label }));

const stageOptions = Object.entries(IDEA_STAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function NewIdeaPage() {
  const router = useRouter();
  const createIdea = useCreateIdea();

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    ministry: '',
    area: 'DIGITALIZATION' as IdeaArea,
    status: 'NEW' as IdeaStatus,
    stage: 'IDEA' as IdeaStage,
    problemDescription: '',
    proposedSolutions: [''],
    opinionDeadline: '',
    questions: [{ question: '', required: false }],
    timeline: [{ title: '', description: '', date: '' }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        proposedSolutions: formData.proposedSolutions.filter((s) => s.trim()),
        questions: formData.questions.filter((q) => q.question.trim()),
        timeline: formData.timeline.filter((t) => t.title.trim() && t.date),
        opinionDeadline: formData.opinionDeadline || undefined,
      };

      await createIdea.mutateAsync(data);
      router.push('/admin/ideas');
    } catch (error: any) {
      alert(error.message || 'Wystąpił błąd podczas tworzenia pomysłu');
    }
  };

  const addSolution = () => {
    setFormData({
      ...formData,
      proposedSolutions: [...formData.proposedSolutions, ''],
    });
  };

  const removeSolution = (index: number) => {
    setFormData({
      ...formData,
      proposedSolutions: formData.proposedSolutions.filter((_, i) => i !== index),
    });
  };

  const updateSolution = (index: number, value: string) => {
    const newSolutions = [...formData.proposedSolutions];
    newSolutions[index] = value;
    setFormData({ ...formData, proposedSolutions: newSolutions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', required: false }],
    });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const updateQuestion = (
    index: number,
    field: 'question' | 'required',
    value: string | boolean
  ) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({ ...formData, questions: newQuestions });
  };

  const addTimelineEvent = () => {
    setFormData({
      ...formData,
      timeline: [...formData.timeline, { title: '', description: '', date: '' }],
    });
  };

  const removeTimelineEvent = (index: number) => {
    setFormData({
      ...formData,
      timeline: formData.timeline.filter((_, i) => i !== index),
    });
  };

  const updateTimelineEvent = (
    index: number,
    field: 'title' | 'description' | 'date',
    value: string
  ) => {
    const newTimeline = [...formData.timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setFormData({ ...formData, timeline: newTimeline });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/admin/ideas"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do listy pomysłów
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nowy pomysł</h1>
          <p className="text-gray-600">Dodaj nowy pomysł do prekonsultacji</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Podstawowe informacje */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Podstawowe informacje
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tytuł pomysłu *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="np. Ustawa o cyfrowej tożsamości obywateli"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Krótki opis (prosty język) *
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                rows={3}
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="Krótko wyjaśnij czego dotyczy pomysł, używając prostego języka zrozumiałego dla każdego obywatela"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ministerstwo *
                </label>
                <Input
                  value={formData.ministry}
                  onChange={(e) =>
                    setFormData({ ...formData, ministry: e.target.value })
                  }
                  placeholder="np. Ministerstwo Cyfryzacji"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obszar tematyczny *
                </label>
                <Select
                  options={areaOptions}
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value as IdeaArea })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as IdeaStatus,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etap pomysłu
                </label>
                <Select
                  options={stageOptions}
                  value={formData.stage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stage: e.target.value as IdeaStage,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Termin zgłaszania opinii
                </label>
                <Input
                  type="date"
                  value={formData.opinionDeadline}
                  onChange={(e) =>
                    setFormData({ ...formData, opinionDeadline: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Problem i rozwiązania */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Problem i rozwiązania
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem dziś *
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                rows={4}
                value={formData.problemDescription}
                onChange={(e) =>
                  setFormData({ ...formData, problemDescription: e.target.value })
                }
                placeholder="Opisz obecny problem, który ma rozwiązać ten pomysł"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proponowane kierunki rozwiązań
              </label>
              <div className="space-y-2">
                {formData.proposedSolutions.map((solution, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={solution}
                      onChange={(e) => updateSolution(index, e.target.value)}
                      placeholder={`Kierunek ${index + 1}`}
                    />
                    {formData.proposedSolutions.length > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeSolution(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addSolution}>
                  <Plus className="w-4 h-4 mr-1" />
                  Dodaj kierunek
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pytania do obywateli */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pytania do obywateli
            </h2>
          </div>

          <div className="space-y-4">
            {formData.questions.map((q, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(index, 'question', e.target.value)
                      }
                      placeholder="Treść pytania..."
                    />
                  </div>
                  {formData.questions.length > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      updateQuestion(index, 'required', e.target.checked)
                    }
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  Pytanie wymagane
                </label>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-1" />
              Dodaj pytanie
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Timeline Etapu 0
            </h2>
          </div>

          <div className="space-y-4">
            {formData.timeline.map((event, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      value={event.title}
                      onChange={(e) =>
                        updateTimelineEvent(index, 'title', e.target.value)
                      }
                      placeholder="Tytuł wydarzenia"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={event.date}
                      onChange={(e) =>
                        updateTimelineEvent(index, 'date', e.target.value)
                      }
                    />
                    {formData.timeline.length > 1 && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => removeTimelineEvent(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <Input
                    value={event.description}
                    onChange={(e) =>
                      updateTimelineEvent(index, 'description', e.target.value)
                    }
                    placeholder="Opis (opcjonalnie)"
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="secondary" onClick={addTimelineEvent}>
              <Plus className="w-4 h-4 mr-1" />
              Dodaj wydarzenie
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/ideas">
            <Button type="button" variant="secondary">
              Anuluj
            </Button>
          </Link>
          <Button type="submit" disabled={createIdea.isPending}>
            {createIdea.isPending ? 'Tworzenie...' : 'Utwórz pomysł'}
          </Button>
        </div>
      </form>
    </div>
  );
}
