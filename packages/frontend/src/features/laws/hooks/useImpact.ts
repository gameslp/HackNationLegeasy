import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  LawImpactResponse,
  ImpactAnalysis,
  ImpactComparison,
} from '@/lib/api/types';

interface AdminStageImpactResponse {
  stage: { id: string; name: string; date: string; author: string | null; lawTextContent: string | null };
  phase: { id: string; type: string };
  law: { id: string; name: string };
  analysis: ImpactAnalysis | null;
}

// Public hooks
export const useLawImpact = (lawId: string) => {
  return useQuery({
    queryKey: ['laws', lawId, 'impact'],
    queryFn: async () => {
      return apiClient.get<LawImpactResponse>(`/laws/${lawId}/impact`);
    },
    enabled: !!lawId,
  });
};

export const useStageImpact = (stageId: string) => {
  return useQuery({
    queryKey: ['stages', stageId, 'impact'],
    queryFn: async () => {
      return apiClient.get<{ analysis: ImpactAnalysis }>(`/stages/${stageId}/impact`);
    },
    enabled: !!stageId,
  });
};

export const useCompareImpact = (lawId: string, sourceStageId: string, targetStageId: string) => {
  return useQuery({
    queryKey: ['laws', lawId, 'impact', 'compare', sourceStageId, targetStageId],
    queryFn: async () => {
      return apiClient.get<ImpactComparison>(
        `/laws/${lawId}/impact/compare?sourceStageId=${sourceStageId}&targetStageId=${targetStageId}`
      );
    },
    enabled: !!lawId && !!sourceStageId && !!targetStageId,
  });
};

// Admin hooks
export const useAdminStageImpact = (stageId: string) => {
  return useQuery({
    queryKey: ['admin', 'stages', stageId, 'impact'],
    queryFn: async () => {
      return apiClient.get<AdminStageImpactResponse>(`/admin/stages/${stageId}/impact`);
    },
    enabled: !!stageId,
  });
};

export const useGenerateImpact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stageId: string) => {
      return apiClient.post<ImpactAnalysis>(`/admin/stages/${stageId}/impact/generate`, {});
    },
    onSuccess: (_, stageId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stages', stageId, 'impact'] });
      queryClient.invalidateQueries({ queryKey: ['stages', stageId, 'impact'] });
    },
  });
};

export const useUpdateImpact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stageId,
      data,
    }: {
      stageId: string;
      data: Partial<ImpactAnalysis>;
    }) => {
      return apiClient.put<ImpactAnalysis>(`/admin/stages/${stageId}/impact`, data);
    },
    onSuccess: (_, { stageId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stages', stageId, 'impact'] });
      queryClient.invalidateQueries({ queryKey: ['stages', stageId, 'impact'] });
    },
  });
};

export const useToggleImpactPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stageId,
      isPublished,
    }: {
      stageId: string;
      isPublished: boolean;
    }) => {
      return apiClient.post<ImpactAnalysis>(`/admin/stages/${stageId}/impact/publish`, { isPublished });
    },
    onSuccess: (_, { stageId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stages', stageId, 'impact'] });
      queryClient.invalidateQueries({ queryKey: ['stages', stageId, 'impact'] });
    },
  });
};
