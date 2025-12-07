'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  Law,
  LawWithPhases,
  Phase,
  PhaseWithStages,
  Stage,
  StageDetail,
  DiffResult,
  AnalysisResult,
  DiffAnalysisResult,
  Discussion,
  StageFile,
} from '@/lib/api/types';

// Laws
export function useLaws(search?: string, phaseType?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (phaseType) params.set('phaseType', phaseType);
  const query = params.toString();

  return useQuery({
    queryKey: ['laws', search, phaseType],
    queryFn: () =>
      apiClient.get<{ laws: Law[]; total: number }>(`/laws${query ? `?${query}` : ''}`),
  });
}

export function useLaw(lawId: string) {
  return useQuery({
    queryKey: ['law', lawId],
    queryFn: () => apiClient.get<LawWithPhases>(`/laws/${lawId}`),
    enabled: !!lawId,
  });
}

export function useCreateLaw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Law>) => apiClient.post<Law>('/laws', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laws'] });
    },
  });
}

export function useUpdateLaw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Law> }) =>
      apiClient.put<Law>(`/laws/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['laws'] });
      queryClient.invalidateQueries({ queryKey: ['law', id] });
    },
  });
}

export function useDeleteLaw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/laws/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laws'] });
    },
  });
}

// Phases
export function usePhase(lawId: string, phaseId: string) {
  return useQuery({
    queryKey: ['phase', lawId, phaseId],
    queryFn: () =>
      apiClient.get<PhaseWithStages>(`/laws/${lawId}/phases/${phaseId}`),
    enabled: !!lawId && !!phaseId,
  });
}

export function useCreatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lawId, data }: { lawId: string; data: Partial<Phase> }) =>
      apiClient.post<Phase>(`/laws/${lawId}/phases`, data),
    onSuccess: (_, { lawId }) => {
      queryClient.invalidateQueries({ queryKey: ['law', lawId] });
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      data,
    }: {
      lawId: string;
      phaseId: string;
      data: Partial<Phase>;
    }) => apiClient.put<Phase>(`/laws/${lawId}/phases/${phaseId}`, data),
    onSuccess: (_, { lawId, phaseId }) => {
      queryClient.invalidateQueries({ queryKey: ['law', lawId] });
      queryClient.invalidateQueries({ queryKey: ['phase', lawId, phaseId] });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lawId, phaseId }: { lawId: string; phaseId: string }) =>
      apiClient.delete(`/laws/${lawId}/phases/${phaseId}`),
    onSuccess: (_, { lawId }) => {
      queryClient.invalidateQueries({ queryKey: ['law', lawId] });
    },
  });
}

// Stages
export function useStage(lawId: string, phaseId: string, stageId: string) {
  return useQuery({
    queryKey: ['stage', lawId, phaseId, stageId],
    queryFn: () =>
      apiClient.get<StageDetail>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}`
      ),
    enabled: !!lawId && !!phaseId && !!stageId,
  });
}

export function useAllStages(lawId: string) {
  return useQuery({
    queryKey: ['allStages', lawId],
    queryFn: () =>
      apiClient.get<{ stages: Stage[] }>(`/laws/${lawId}/stages`),
    enabled: !!lawId,
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      data,
    }: {
      lawId: string;
      phaseId: string;
      data: Partial<Stage>;
    }) => apiClient.post<Stage>(`/laws/${lawId}/phases/${phaseId}/stages`, data),
    onSuccess: (_, { lawId, phaseId }) => {
      queryClient.invalidateQueries({ queryKey: ['phase', lawId, phaseId] });
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      data,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      data: Partial<Stage>;
    }) =>
      apiClient.put<Stage>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}`,
        data
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({ queryKey: ['phase', lawId, phaseId] });
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
    }) => apiClient.delete(`/laws/${lawId}/phases/${phaseId}/stages/${stageId}`),
    onSuccess: (_, { lawId, phaseId }) => {
      queryClient.invalidateQueries({ queryKey: ['phase', lawId, phaseId] });
    },
  });
}

// Diff
export function useDiff(lawId: string, sourceStageId: string, targetStageId: string) {
  return useQuery({
    queryKey: ['diff', lawId, sourceStageId, targetStageId],
    queryFn: () =>
      apiClient.get<DiffResult>(
        `/laws/${lawId}/diff?sourceStageId=${sourceStageId}&targetStageId=${targetStageId}`
      ),
    enabled: !!lawId && !!sourceStageId && !!targetStageId,
  });
}

// Analyze Diff with AI
export function useAnalyzeDiff() {
  return useMutation({
    mutationFn: ({
      lawId,
      diffContent,
      sourceStage,
      targetStage,
    }: {
      lawId: string;
      diffContent: string;
      sourceStage: string;
      targetStage: string;
    }) =>
      apiClient.post<DiffAnalysisResult>(`/laws/${lawId}/analyze-diff`, {
        diffContent,
        sourceStage,
        targetStage,
      }),
  });
}

// Law PDF
export function useUploadLawPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      file,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      file: File;
    }) =>
      apiClient.uploadFile<{ stage: Stage; extractedTextLength: number }>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/law-pdf`,
        file,
        'application/pdf'
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['allStages', lawId],
      });
    },
  });
}

export function useDeleteLawPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
    }) =>
      apiClient.delete(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/law-pdf`
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
      queryClient.invalidateQueries({
        queryKey: ['allStages', lawId],
      });
    },
  });
}

// AI Analysis
export function useAnalyze() {
  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      fileId,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      fileId?: string;
    }) =>
      apiClient.post<AnalysisResult>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/analyze`,
        { fileId }
      ),
  });
}

// Discussions
export function useCreateDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      data,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      data: { nickname: string; content: string };
    }) =>
      apiClient.post<Discussion>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/discussions`,
        data
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
    },
  });
}

// Files
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      file,
      fileType,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      file: File;
      fileType: string;
    }) =>
      apiClient.uploadFile<StageFile>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/files`,
        file,
        fileType
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
    },
  });
}

export function useImportFileFromLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      url,
      name,
      stageName,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      url: string;
      name?: string;
      stageName?: string;
    }) =>
      apiClient.post<{ stageFile: StageFile; stageName: string | null }>(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/files/from-link`,
        { url, name, stageName, fileType: 'RELATED' }
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      lawId,
      phaseId,
      stageId,
      fileId,
    }: {
      lawId: string;
      phaseId: string;
      stageId: string;
      fileId: string;
    }) =>
      apiClient.delete(
        `/laws/${lawId}/phases/${phaseId}/stages/${stageId}/files/${fileId}`
      ),
    onSuccess: (_, { lawId, phaseId, stageId }) => {
      queryClient.invalidateQueries({
        queryKey: ['stage', lawId, phaseId, stageId],
      });
    },
  });
}

// Sejm Import
export function useImportSejmProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ term, processNumber, lawId }: { term: number; processNumber: string; lawId?: string }) =>
      apiClient.post<LawWithPhases>('/admin/laws/import', { term, processNumber, lawId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['laws'] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['law', data.id] });
      }
    },
  });
}
