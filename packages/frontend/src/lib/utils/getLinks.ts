import { apiClient } from '../api/client';

/**
 * Calls backend to scan external link for files related to a phase.
 * Returns list of absolute URLs.
 */
export async function fetchLinksFromHtml(
  phaseName: string,
  link: string,
  stageName?: string
) {
  const { links, stageName: returnedStageName } = await apiClient.post<{
    links: { url: string; name: string }[];
    stageName: string | null;
  }>(
    '/admin/scan-links',
    { phaseName, link, stageName }
  );
  return { links, stageName: returnedStageName };
}
