import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  Idea,
  IdeaWithDetails,
  IdeaStats,
  IdeaArea,
  IdeaStatus,
  IdeaStage,
  RespondentType,
  IdeaOpinion,
  IdeaSurveyResponse,
} from '@/lib/api/types';

interface IdeasResponse {
  ideas: Idea[];
  total: number;
}

interface IdeasFilters {
  search?: string;
  area?: IdeaArea | '';
  status?: IdeaStatus | '';
  stage?: IdeaStage | '';
  sort?: 'newest' | 'deadline' | 'oldest';
}

// Hook do pobierania listy pomysłów
export function useIdeas(filters: IdeasFilters = {}) {
  return useQuery({
    queryKey: ['ideas', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.area) params.append('area', filters.area);
      if (filters.status) params.append('status', filters.status);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await apiClient.get<IdeasResponse>(
        `/ideas?${params.toString()}`
      );
      return response;
    },
  });
}

// Hook do pobierania szczegółów pomysłu
export function useIdea(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['idea', ideaId],
    queryFn: async () => {
      const response = await apiClient.get<IdeaWithDetails>(`/ideas/${ideaId}`);
      return response;
    },
    enabled: !!ideaId,
  });
}

// Hook do pobierania statystyk pomysłu
export function useIdeaStats(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['idea-stats', ideaId],
    queryFn: async () => {
      const response = await apiClient.get<IdeaStats>(`/ideas/${ideaId}/stats`);
      return response;
    },
    enabled: !!ideaId,
    refetchInterval: 30000, // Odświeżaj co 30 sekund
  });
}

// Hook do głosowania w ankiecie
interface SurveyData {
  firstName: string;
  lastName: string;
  email: string;
  support: number;
  importance: number;
}

export function useSubmitSurvey(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SurveyData) => {
      const response = await apiClient.post<IdeaSurveyResponse>(
        `/ideas/${ideaId}/survey`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea-stats', ideaId] });
    },
  });
}

// Hook do dodawania opinii
interface OpinionData {
  firstName: string;
  lastName: string;
  email: string;
  respondentType: RespondentType;
  organization?: string;
  answers?: Record<string, string>;
}

export function useSubmitOpinion(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OpinionData) => {
      const response = await apiClient.post<IdeaOpinion>(
        `/ideas/${ideaId}/opinion`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea-stats', ideaId] });
    },
  });
}

// ========================================
// ADMIN HOOKS
// ========================================

interface CreateIdeaData {
  title: string;
  shortDescription: string;
  ministry: string;
  area: IdeaArea;
  status?: IdeaStatus;
  stage?: IdeaStage;
  problemDescription: string;
  proposedSolutions?: string[];
  opinionDeadline?: string;
  questions?: { question: string; required?: boolean }[];
  timeline?: { title: string; description?: string; date: string }[];
}

export function useCreateIdea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIdeaData) => {
      const response = await apiClient.post<IdeaWithDetails>('/ideas', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

interface UpdateIdeaData {
  title?: string;
  shortDescription?: string;
  ministry?: string;
  area?: IdeaArea;
  status?: IdeaStatus;
  stage?: IdeaStage;
  problemDescription?: string;
  proposedSolutions?: string[];
  opinionDeadline?: string | null;
  closureReason?: string;
  aiSummaryPublic?: boolean;
}

export function useUpdateIdea(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateIdeaData) => {
      const response = await apiClient.put<IdeaWithDetails>(
        `/ideas/${ideaId}`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useUpdateIdeaStatus(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { status: IdeaStatus; closureReason?: string }) => {
      const response = await apiClient.put<Idea>(
        `/ideas/${ideaId}/status`,
        data
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

export function useAddQuestion(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { question: string; required?: boolean }) => {
      const response = await apiClient.post(`/ideas/${ideaId}/questions`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

export function useDeleteQuestion(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: string) => {
      await apiClient.delete(`/ideas/${ideaId}/questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

export function useAddTimelineEvent(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      date: string;
    }) => {
      const response = await apiClient.post(`/ideas/${ideaId}/timeline`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

// Hook do pobierania opinii dla admina
export function useIdeaOpinions(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['idea-opinions', ideaId],
    queryFn: async () => {
      const response = await apiClient.get<{
        opinions: IdeaOpinion[];
        total: number;
      }>(`/ideas/${ideaId}/opinions`);
      return response;
    },
    enabled: !!ideaId,
  });
}

// Hook do pobierania odpowiedzi z ankiety dla admina
export function useIdeaSurveys(ideaId: string | undefined) {
  return useQuery({
    queryKey: ['idea-surveys', ideaId],
    queryFn: async () => {
      const response = await apiClient.get<{
        surveys: IdeaSurveyResponse[];
        total: number;
      }>(`/ideas/${ideaId}/surveys`);
      return response;
    },
    enabled: !!ideaId,
  });
}

// Hook do generowania AI podsumowania
export function useGenerateAiSummary(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<{
        summary: string;
        details: {
          summary: string;
          mainConcerns: string[];
          mainBenefits: string[];
          recommendations: string[];
        };
      }>(`/ideas/${ideaId}/ai-summary`, {});
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

// Hook do przekształcenia pomysłu w ustawę
export function useConvertToLaw(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      lawName?: string;
      lawDescription?: string;
      lawAuthor?: string;
    }) => {
      const response = await apiClient.post<{
        law: { id: string; name: string };
        ideaId: string;
      }>(`/ideas/${ideaId}/convert-to-law`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });
}

// Hook do uploadu pliku do pomysłu
export function useUploadIdeaAttachment(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/ideas/${ideaId}/attachments`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Błąd uploadu pliku');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

// Hook do usunięcia pliku
export function useDeleteIdeaAttachment(ideaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      await apiClient.delete(`/ideas/${ideaId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}
