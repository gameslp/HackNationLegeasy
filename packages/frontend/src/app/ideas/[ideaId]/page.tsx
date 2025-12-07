'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Markdown from 'react-markdown';
import {
  useIdea,
  useIdeaStats,
  useSubmitSurvey,
  useSubmitOpinion,
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
  RespondentType,
} from '@/lib/api/types';
import {
  Lightbulb,
  Building2,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
} from 'lucide-react';

export default function IdeaDetailPage() {
  const { ideaId } = useParams();
  const { data: idea, isLoading: ideaLoading } = useIdea(ideaId as string);
  const { data: stats, isLoading: statsLoading } = useIdeaStats(
    ideaId as string
  );

  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [showOpinionForm, setShowOpinionForm] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [opinionSubmitted, setOpinionSubmitted] = useState(false);

  // Survey form state
  const [surveyData, setSurveyData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    support: 0,
    importance: 0,
  });

  // Opinion form state
  const [opinionData, setOpinionData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    respondentType: 'CITIZEN' as RespondentType,
    organization: '',
    answers: {} as Record<string, string>,
  });

  const submitSurvey = useSubmitSurvey(ideaId as string);
  const submitOpinion = useSubmitOpinion(ideaId as string);

  const isCollecting = idea?.status === 'COLLECTING';
  const deadlinePassed =
    idea?.opinionDeadline && new Date(idea.opinionDeadline) < new Date();
  const canParticipate = isCollecting && !deadlinePassed;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitSurvey.mutateAsync(surveyData);
      setSurveySubmitted(true);
      setShowSurveyForm(false);
    } catch (error: any) {
      alert(error.message || 'Wystąpił błąd podczas wysyłania ankiety');
    }
  };

  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitOpinion.mutateAsync(opinionData);
      setOpinionSubmitted(true);
      setShowOpinionForm(false);
    } catch (error: any) {
      alert(error.message || 'Wystąpił błąd podczas wysyłania opinii');
    }
  };

  if (ideaLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-2xl" />
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
        <Link href="/ideas">
          <Button>Wróć do listy pomysłów</Button>
        </Link>
      </div>
    );
  }

  // Oblicz procenty poparcia dla wizualizacji
  const supportFor =
    (stats?.survey.supportPercentages.for || 0) +
    (stats?.survey.supportPercentages.ratherFor || 0);
  const supportAgainst =
    (stats?.survey.supportPercentages.against || 0) +
    (stats?.survey.supportPercentages.ratherAgainst || 0);

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/ideas"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do listy pomysłów
      </Link>

      {/* Sekcja 1: Nagłówek */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-xl">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        </div>

        <div className="relative px-8 py-10 sm:px-12">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
              {IDEA_AREA_LABELS[idea.area]}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
              {isCollecting && !deadlinePassed && '🟢 '}
              {idea.status === 'NEW' && '🔵 '}
              {IDEA_STATUS_LABELS[idea.status]}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
              {IDEA_STAGE_LABELS[idea.stage]}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {idea.title}
          </h1>

          <p className="text-lg text-orange-100/90 mb-6 max-w-3xl">
            {idea.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{idea.ministry}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Opublikowano: {formatDate(idea.publishDate)}</span>
            </div>
            {idea.opinionDeadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {deadlinePassed
                    ? 'Opiniowanie zakończone'
                    : `Opiniuj do: ${formatDate(idea.opinionDeadline)}`}
                </span>
              </div>
            )}
          </div>

          {/* Link do ustawy jeśli przekształcony */}
          {idea.law && (
            <div className="mt-6 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  Ten pomysł stał się projektem ustawy
                </span>
                <Link
                  href={`/laws/${idea.law.id}`}
                  className="inline-flex items-center gap-1 text-white underline hover:no-underline ml-2"
                >
                  Zobacz proces legislacyjny
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sekcja 2: Problem + Rozwiązania */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Problem dziś</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {idea.problemDescription}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Co rozważamy?</h2>
          </div>
          {Array.isArray(idea.proposedSolutions) &&
          idea.proposedSolutions.length > 0 ? (
            <ul className="space-y-3">
              {idea.proposedSolutions.map((solution, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{solution}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">
              Brak zdefiniowanych kierunków rozwiązań
            </p>
          )}
        </div>
      </div>

      {/* Info o statusie NEW */}
      {idea.status === 'NEW' && (
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Pomysł w przygotowaniu
              </h3>
              <p className="text-blue-700">
                Ten pomysł został właśnie opublikowany. Zbieranie opinii obywateli
                rozpocznie się wkrótce. Wróć tu za jakiś czas, aby podzielić się
                swoją opinią!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sekcja 3: Partycypacja */}
      {canParticipate && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Jak możesz się wypowiedzieć?
          </h2>
          <p className="text-gray-600 mb-6">
            Twój głos ma znaczenie! Wybierz sposób, w jaki chcesz się
            wypowiedzieć.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Szybka ankieta */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Szybka ankieta</h3>
                  <p className="text-sm text-gray-500">2 pytania, 1 minuta</p>
                </div>
              </div>

              {surveySubmitted ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Dziękujemy za oddanie głosu!
                  </span>
                </div>
              ) : showSurveyForm ? (
                <form onSubmit={handleSurveySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Imię"
                      value={surveyData.firstName}
                      onChange={(e) =>
                        setSurveyData({ ...surveyData, firstName: e.target.value })
                      }
                      required
                    />
                    <Input
                      placeholder="Nazwisko"
                      value={surveyData.lastName}
                      onChange={(e) =>
                        setSurveyData({ ...surveyData, lastName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={surveyData.email}
                    onChange={(e) =>
                      setSurveyData({ ...surveyData, email: e.target.value })
                    }
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Czy popierasz kierunek zmian?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[4, 3, 2, 1].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setSurveyData({ ...surveyData, support: value })
                          }
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            surveyData.support === value
                              ? value >= 3
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : 'bg-red-100 border-red-500 text-red-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {SUPPORT_LABELS[value]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Na ile ten temat jest dla Ciebie ważny?
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setSurveyData({ ...surveyData, importance: value })
                          }
                          className={`flex-1 p-3 rounded-lg border transition-all ${
                            surveyData.importance === value
                              ? 'bg-amber-100 border-amber-500'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <Star
                            className={`w-5 h-5 mx-auto ${
                              surveyData.importance >= value
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowSurveyForm(false)}
                    >
                      Anuluj
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        submitSurvey.isPending ||
                        !surveyData.support ||
                        !surveyData.importance
                      }
                    >
                      {submitSurvey.isPending ? 'Wysyłanie...' : 'Wyślij głos'}
                    </Button>
                  </div>
                </form>
              ) : (
                <Button onClick={() => setShowSurveyForm(true)} className="w-full">
                  Wypełnij ankietę
                </Button>
              )}
            </div>

            {/* Szczegółowa opinia */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Szczegółowa opinia
                  </h3>
                  <p className="text-sm text-gray-500">
                    Odpowiedz na pytania otwarte
                  </p>
                </div>
              </div>

              {opinionSubmitted ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    Dziękujemy za Twoją opinię!
                  </span>
                </div>
              ) : showOpinionForm ? (
                <form onSubmit={handleOpinionSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Imię"
                      value={opinionData.firstName}
                      onChange={(e) =>
                        setOpinionData({
                          ...opinionData,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      placeholder="Nazwisko"
                      value={opinionData.lastName}
                      onChange={(e) =>
                        setOpinionData({
                          ...opinionData,
                          lastName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={opinionData.email}
                    onChange={(e) =>
                      setOpinionData({ ...opinionData, email: e.target.value })
                    }
                    required
                  />

                  <Select
                    options={Object.entries(RESPONDENT_TYPE_LABELS).map(
                      ([value, label]) => ({ value, label })
                    )}
                    value={opinionData.respondentType}
                    onChange={(e) =>
                      setOpinionData({
                        ...opinionData,
                        respondentType: e.target.value as RespondentType,
                      })
                    }
                  />

                  {(opinionData.respondentType === 'NGO' ||
                    opinionData.respondentType === 'COMPANY') && (
                    <Input
                      placeholder="Nazwa organizacji/firmy"
                      value={opinionData.organization}
                      onChange={(e) =>
                        setOpinionData({
                          ...opinionData,
                          organization: e.target.value,
                        })
                      }
                    />
                  )}

                  {idea.questions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.question}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <textarea
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                        rows={3}
                        placeholder="Twoja odpowiedź..."
                        value={opinionData.answers[question.id] || ''}
                        onChange={(e) =>
                          setOpinionData({
                            ...opinionData,
                            answers: {
                              ...opinionData.answers,
                              [question.id]: e.target.value,
                            },
                          })
                        }
                        required={question.required}
                      />
                    </div>
                  ))}

                  {idea.questions.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      Brak pytań do odpowiedzi. Możesz wypełnić szybką ankietę.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowOpinionForm(false)}
                    >
                      Anuluj
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitOpinion.isPending}
                    >
                      {submitOpinion.isPending ? 'Wysyłanie...' : 'Wyślij opinię'}
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  onClick={() => setShowOpinionForm(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Podziel się opinią
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sekcja 4: Zebrane opinie - statystyki */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Jakie opinie już zebraliśmy?
        </h2>

        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liczniki */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Liczba odpowiedzi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.survey.total}
                  </div>
                  <div className="text-sm text-blue-600">głosów w ankiecie</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.opinions.total}
                  </div>
                  <div className="text-sm text-purple-600">
                    szczegółowych opinii
                  </div>
                </div>
              </div>

              {/* Podział według typu respondenta */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  Opinie według typu respondenta
                </h4>
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
              </div>
            </div>

            {/* Wykres poparcia */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Wyniki ankiety</h3>

              {stats.survey.total > 0 ? (
                <>
                  {/* Bar chart */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-600 font-medium">
                            Popiera kierunek
                          </span>
                          <span className="text-green-600 font-bold">
                            {supportFor}%
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                            style={{ width: `${supportFor}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600 font-medium">
                            Ma zastrzeżenia
                          </span>
                          <span className="text-red-600 font-bold">
                            {supportAgainst}%
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-500"
                            style={{ width: `${supportAgainst}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Średnia ważność */}
                  <div className="bg-amber-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-700">
                        Średnia ważność tematu
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i <= Math.round(stats.survey.avgImportance)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 font-bold text-amber-700">
                          {stats.survey.avgImportance}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Brak głosów w ankiecie. Bądź pierwszy!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* AI Summary - tylko gdy opublikowane */}
        {idea.aiSummary && idea.aiSummaryPublic && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-900">
                Podsumowanie AI
              </h4>
            </div>
            <div className="prose prose-sm prose-purple max-w-none text-purple-800">
              <Markdown>{idea.aiSummary}</Markdown>
            </div>
            {idea.aiSummaryDate && (
              <p className="text-xs text-purple-500 mt-2">
                Wygenerowano: {formatDate(idea.aiSummaryDate)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sekcja 5: Załączniki */}
      {idea.attachments && idea.attachments.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Dokumenty do pobrania</h2>
          </div>

          <div className="space-y-3">
            {idea.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ideas/${idea.id}/attachments/${attachment.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {attachment.fileName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB •
                      Dodano: {new Date(attachment.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Download className="w-5 h-5" />
                  <span className="text-sm font-medium">Pobierz</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Sekcja 6: Timeline */}
      {idea.timeline.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Przebieg Etapu 0
          </h2>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {idea.timeline.map((event, index) => (
                <div key={event.id} className="relative flex gap-4">
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      index === idea.timeline.length - 1
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-500'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="text-sm text-gray-500 mb-1">
                      {formatDate(event.date)}
                    </div>
                    <h4 className="font-semibold text-gray-900">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-gray-600 text-sm mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info o zamknięciu */}
      {!canParticipate && (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Zbieranie opinii zakończone
              </h3>
              <p className="text-gray-600">
                {idea.closureReason ||
                  'Dziękujemy wszystkim za udział w prekonsultacjach. Wyniki są analizowane.'}
              </p>
              {idea.law && (
                <Link
                  href={`/laws/${idea.law.id}`}
                  className="inline-flex items-center gap-2 text-primary-600 font-medium mt-3 hover:underline"
                >
                  Zobacz dalszy proces legislacyjny
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
