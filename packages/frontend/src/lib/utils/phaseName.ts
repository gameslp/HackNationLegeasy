import { apiClient } from '../api/client';
import type { PhaseNameResult } from '../api/types';

export async function fetchPhaseName(phaseId: string): Promise<PhaseNameResult> {
  return apiClient.get<PhaseNameResult>(`/admin/phases/${phaseId}/name`);
}
