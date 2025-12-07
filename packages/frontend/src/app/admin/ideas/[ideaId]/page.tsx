'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import {
  useIdea,
  useIdeaStats,
  useIdeaOpinions,
  useIdeaSurveys,
  useUpdateIdea,
  useUpdateIdeaStatus,
  useAddQuestion,
  useDeleteQuestion,
  useAddTimelineEvent,
  useGenerateAiSummary,
  useConvertToLaw,
  useUploadIdeaAttachment,
  useDeleteIdeaAttachment,
} from '@/features/ideas/hooks/useIdeas';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  IDEA_AREA_LABELS,
  IDEA_STATUS_LABELS,
  IDEA_STAGE_LABELS,
  RESPONDENT_TYPE_LABELS,
  SUPPORT_LABELS,
  IdeaStatus,
  RespondentType,
} from '@/lib/api/types';
import {
  ArrowLeft,
  Lightbulb,
  Users,
  MessageSquare,
  Calendar,
  Building2,
  Star,
  Trash2,
  Plus,
  Play,
  Pause,
  Archive,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  EyeOff,
  Upload,
  Download,
  File,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  COLLECTING: 'bg-green-100 text-green-800',
  SUMMARIZING: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  CONVERTED: 'bg-purple-100 text-purple-800',
};

export default function AdminIdeaDetailPage() {
  const { ideaId } = useParams();
  const router = useRouter();

  const { data: idea, isLoading: ideaLoading } = useIdea(ideaId as string);
  const { data: stats } = useIdeaStats(ideaId as string);
  const { data: opinionsData } = useIdeaOpinions(ideaId as string);
  const { data: surveysData } = useIdeaSurveys(ideaId as string);

  const updateIdea = useUpdateIdea(ideaId as string);
  const updateStatus = useUpdateIdeaStatus(ideaId as string);
  const addQuestion = useAddQuestion(ideaId as string);
  const deleteQuestion = useDeleteQuestion(ideaId as string);
  const addTimelineEvent = useAddTimelineEvent(ideaId as string);
  const generateAiSummary = useGenerateAiSummary(ideaId as string);
  const convertToLaw = useConvertToLaw(ideaId as string);
  const uploadAttachment = useUploadIdeaAttachment(ideaId as string);
  const deleteAttachment = useDeleteIdeaAttachment(ideaId as string);

  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [closureReason, setClosureReason] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'surveys' | 'opinions'>(
    'overview'
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = async (newStatus: IdeaStatus) => {
    try {
      await updateStatus.mutateAsync({
        status: newStatus,
        closureReason: newStatus === 'ARCHIVED' ? closureReason : undefined,
      });
    } catch (error: any) {
      alert(error.message || 'Błąd zmiany statusu');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    try {
      await addQuestion.mutateAsync({
        question: newQuestion,
        required: newQuestionRequired,
      });
      setNewQuestion('');
      setNewQuestionRequired(false);
    } catch (error: any) {
      alert(error.message || 'Błąd dodawania pytania');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to pytanie?')) return;
    try {
      await deleteQuestion.mutateAsync(questionId);
    } catch (error: any) {
      alert(error.message || 'Błąd usuwania pytania');
    }
  };

  const handleAddTimelineEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    try {
      await addTimelineEvent.mutateAsync({
        title: newEventTitle,
        date: newEventDate,
      });
      setNewEventTitle('');
      setNewEventDate('');
    } catch (error: any) {
      alert(error.message || 'Błąd dodawania wydarzenia');
    }
  };

  const handleGenerateAiSummary = async () => {
    try {
      await generateAiSummary.mutateAsync();
      alert('Podsumowanie AI zostało wygenerowane');
    } catch (error: any) {
      alert(error.message || 'Błąd generowania podsumowania');
    }
  };

  const handleConvertToLaw = async () => {
    try {
      const result = await convertToLaw.mutateAsync({});
      alert(`Ustawa została utworzona: ${result.law.name}`);
      setShowConvertModal(false);
      router.push(`/laws/${result.law.id}`);
    } catch (error: any) {
      alert(error.message || 'Błąd przekształcania w ustawę');
    }
  };

  if (ideaLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Pomysł nie został znaleziony
        </h1>
        <Link href="/admin/ideas">
          <Button>Wróć do listy pomysłów</Button>
        </Link>
      </div>
    );
  }

  const supportFor =
    (stats?.survey.supportPercentages.for || 0) +
    (stats?.survey.supportPercentages.ratherFor || 0);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/ideas"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do listy pomysłów
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusColors[idea.status]
                  }`}
                >
                  {IDEA_STATUS_LABELS[idea.status]}
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {idea.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {idea.ministry}
              </div>
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                {IDEA_AREA_LABELS[idea.area]}
              </span>
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                {IDEA_STAGE_LABELS[idea.stage]}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {stats?.survey.total || 0}
              </div>
              <div className="text-xs text-blue-600">Głosów</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.opinions.total || 0}
              </div>
              <div className="text-xs text-purple-600">Opinii</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">{supportFor}%</div>
              <div className="text-xs text-green-600">Poparcie</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          {idea.status === 'NEW' && (
            <Button onClick={() => handleStatusChange('COLLECTING')}>
              <Play className="w-4 h-4 mr-1" />
              Rozpocznij zbieranie opinii
            </Button>
          )}

          {idea.status === 'COLLECTING' && (
            <>
              <Button onClick={() => handleStatusChange('SUMMARIZING')}>
                <Pause className="w-4 h-4 mr-1" />
                Zakończ zbieranie, podsumuj
              </Button>
            </>
          )}

          {(idea.status === 'COLLECTING' || idea.status === 'SUMMARIZING') && (
            <Button
              variant="secondary"
              onClick={handleGenerateAiSummary}
              disabled={generateAiSummary.isPending}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {generateAiSummary.isPending ? 'Generowanie...' : 'Generuj AI podsumowanie'}
            </Button>
          )}

          {idea.status === 'SUMMARIZING' && (
            <>
              <Button onClick={() => setShowConvertModal(true)}>
                <ArrowRight className="w-4 h-4 mr-1" />
                Przekształć w ustawę
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const reason = prompt('Podaj powód archiwizacji:');
                  if (reason) {
                    setClosureReason(reason);
                    handleStatusChange('ARCHIVED');
                  }
                }}
              >
                <Archive className="w-4 h-4 mr-1" />
                Archiwizuj
              </Button>
            </>
          )}

          <Link href={`/ideas/${idea.id}`} target="_blank">
            <Button variant="secondary">
              Zobacz stronę publiczną
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['overview', 'surveys', 'opinions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' && 'Przegląd'}
            {tab === 'surveys' && `Ankiety (${surveysData?.total || 0})`}
            {tab === 'opinions' && `Opinie (${opinionsData?.total || 0})`}
          </button>
        ))}
      </div>

      {/* AI Summary section */}
      {idea.aiSummary && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900">Podsumowanie AI</h3>
                <div className="flex items-center gap-2">
                  {idea.aiSummaryDate && (
                    <p className="text-xs text-purple-600">
                      Wygenerowano: {new Date(idea.aiSummaryDate).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    idea.aiSummaryPublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {idea.aiSummaryPublic ? (
                      <>
                        <Eye className="w-3 h-3" />
                        Publiczne
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Ukryte
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateIdea.mutate({ aiSummaryPublic: !idea.aiSummaryPublic })}
                disabled={updateIdea.isPending}
              >
                {idea.aiSummaryPublic ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Ukryj
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Opublikuj
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleGenerateAiSummary}
                disabled={generateAiSummary.isPending}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                {generateAiSummary.isPending ? 'Generowanie...' : 'Odśwież'}
              </Button>
            </div>
          </div>
          <div className="prose prose-sm prose-purple max-w-none text-purple-900">
            <Markdown>{idea.aiSummary}</Markdown>
          </div>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Questions management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Pytania do obywateli
            </h3>

            <div className="space-y-3 mb-4">
              {idea.questions.map((q) => (
                <div
                  key={q.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-gray-900">{q.question}</p>
                    {q.required && (
                      <span className="text-xs text-red-500">Wymagane</span>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteQuestion(q.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Input
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Nowe pytanie..."
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={newQuestionRequired}
                    onChange={(e) => setNewQuestionRequired(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Wymagane
                </label>
                <Button
                  size="sm"
                  onClick={handleAddQuestion}
                  disabled={!newQuestion.trim()}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Dodaj
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>

            <div className="space-y-3 mb-4">
              {idea.timeline.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Tytuł wydarzenia..."
                  className="flex-1"
                />
                <Input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button
                size="sm"
                onClick={handleAddTimelineEvent}
                disabled={!newEventTitle.trim() || !newEventDate}
              >
                <Plus className="w-4 h-4 mr-1" />
                Dodaj wydarzenie
              </Button>
            </div>
          </div>

          {/* Survey stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Wyniki ankiety</h3>

            {stats && stats.survey.total > 0 ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">Popiera</span>
                    <span className="text-green-600 font-bold">{supportFor}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${supportFor}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Średnia ważność</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= Math.round(stats.survey.avgImportance)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Brak głosów w ankiecie</p>
            )}
          </div>

          {/* Opinion stats */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Opinie według typu
            </h3>

            {stats && stats.opinions.total > 0 ? (
              <div className="space-y-2">
                {Object.entries(stats.opinions.byType).map(([type, count]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {RESPONDENT_TYPE_LABELS[type as RespondentType]}
                    </span>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Brak opinii</p>
            )}
          </div>

          {/* Attachments management */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-4">
              Załączniki (dokumenty do pomysłu)
            </h3>

            {idea.attachments && idea.attachments.length > 0 ? (
              <div className="space-y-2 mb-4">
                {idea.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {attachment.fileName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB •
                          {new Date(attachment.createdAt).toLocaleDateString('pl-PL')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ideas/${ideaId}/attachments/${attachment.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
                            deleteAttachment.mutate(attachment.id);
                          }
                        }}
                        disabled={deleteAttachment.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-4">Brak załączników</p>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadAttachment.mutate(file);
                    e.target.value = '';
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={uploadAttachment.isPending}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploadAttachment.isPending ? 'Przesyłanie...' : 'Dodaj plik'}
              </Button>
              <span className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT (max 50MB)
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'surveys' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                  Respondent
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                  Poparcie
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                  Ważność
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {surveysData?.surveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {survey.firstName} {survey.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{survey.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        survey.support >= 3
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {SUPPORT_LABELS[survey.support]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i <= survey.importance
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(survey.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {surveysData?.surveys.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Brak odpowiedzi z ankiety
            </div>
          )}
        </div>
      )}

      {activeTab === 'opinions' && (
        <div className="space-y-4">
          {opinionsData?.opinions.map((opinion) => (
            <div
              key={opinion.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {opinion.firstName} {opinion.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{opinion.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {RESPONDENT_TYPE_LABELS[opinion.respondentType]}
                    </span>
                    {opinion.organization && (
                      <span className="text-xs text-gray-500">
                        {opinion.organization}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDate(opinion.createdAt)}
                </div>
              </div>

              {opinion.answers && opinion.answers.length > 0 && (
                <div className="space-y-3">
                  {opinion.answers.map((answer) => (
                    <div
                      key={answer.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {answer.question?.question}
                      </p>
                      <p className="text-sm text-gray-900">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {opinionsData?.opinions.length === 0 && (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-500">
              Brak opinii
            </div>
          )}
        </div>
      )}

      {/* Convert to Law Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Przekształć pomysł w ustawę
            </h2>
            <p className="text-gray-600 mb-6">
              Ta akcja utworzy nowy projekt ustawy na podstawie tego pomysłu.
              Raport z prekonsultacji zostanie dołączony jako pierwszy etap.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Zalecane:</strong> Przed przekształceniem wygeneruj AI
                  podsumowanie wszystkich opinii, które stanie się częścią
                  raportu z prekonsultacji.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowConvertModal(false)}
              >
                Anuluj
              </Button>
              <Button onClick={handleConvertToLaw}>
                <ArrowRight className="w-4 h-4 mr-1" />
                Przekształć w ustawę
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
