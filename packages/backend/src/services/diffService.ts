import * as Diff from 'diff';

export interface DiffResult {
  diff: string;
  additions: number;
  deletions: number;
}

export function computeDiff(
  sourceText: string | null,
  targetText: string | null
): DiffResult {
  const source = sourceText || '';
  const target = targetText || '';

  const patch = Diff.createPatch('law.txt', source, target, 'Source', 'Target');

  let additions = 0;
  let deletions = 0;

  const lines = patch.split('\n');
  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return {
    diff: patch,
    additions,
    deletions,
  };
}
