'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { AdminStats, PhaseListItem, StageListItem } from '@/lib/api/types';

export function useAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => apiClient.get<AdminStats>('/admin/stats'),
  });
}

export function useRecentStage() {
  return useQuery({
    queryKey: ['recentStage'],
    queryFn: () => apiClient.get<{ data: StageListItem }>('/admin/recent-stage'),
  });
}

export function useAllPhases() {
  return useQuery({
    queryKey: ['allPhases'],
    queryFn: () =>
      apiClient.get<{ phases: PhaseListItem[]; total: number }>(
        '/admin/all-phases'
      ),
  });
}

export function useAllStages() {
  return useQuery({
    queryKey: ['allStages'],
    queryFn: () =>
      apiClient.get<{ stages: StageListItem[]; total: number }>(
        '/admin/all-stages'
      ),
  });
}
